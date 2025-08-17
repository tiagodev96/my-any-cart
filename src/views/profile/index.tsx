"use client";

import * as React from "react";
import Container from "@/components/container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getMe, updateMe, sendConfirmationEmail, Me } from "@/lib/api/user";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileView() {
  const [me, setMe] = React.useState<Me | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [preview, setPreview] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null | undefined>(undefined);
  const [saving, setSaving] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    getMe()
      .then((data) => {
        setMe(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      })
      .catch(() => toast.error("Falha a carregar o perfil"));
  }, []);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPT.includes(f.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("A imagem ultrapassa 10MB.");
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function onRemoveAvatar() {
    setFile(null);
    setPreview(null);
  }

  async function onSave() {
    setSaving(true);
    try {
      const updated = await updateMe({
        first_name: firstName,
        last_name: lastName,
        avatar: file,
      });
      setMe(updated);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(undefined);
      toast.success("Perfil atualizado.");
    } catch (e: unknown) {
      console.error(e);
      toast.error("Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function onSendConfirmation() {
    setSending(true);
    try {
      const { detail } = await sendConfirmationEmail();
      toast.success(detail);
    } catch {
      toast.error("Não foi possível enviar o e-mail.");
    } finally {
      setSending(false);
    }
  }

  const initials = React.useMemo(() => {
    const f = firstName?.trim()?.[0] || me?.first_name?.[0] || "";
    const l = lastName?.trim()?.[0] || me?.last_name?.[0] || "";
    return (f + l || me?.email?.[0] || "?").toUpperCase();
  }, [firstName, lastName, me]);

  return (
    <Container verticalPadding>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>O meu perfil</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {preview ? (
                <AvatarImage src={preview} alt="avatar preview" />
              ) : me?.avatar_url ? (
                <AvatarImage src={me.avatar_url} alt="avatar" />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className="space-x-2">
              <Label className="cursor-pointer">
                <span className="sr-only">Escolher avatar</span>
                <Input
                  type="file"
                  accept={ACCEPT.join(",")}
                  className="hidden"
                  onChange={onPickFile}
                />
                <Button variant="secondary">Carregar foto</Button>
              </Label>
              {(me?.avatar_url || preview) && (
                <Button variant="outline" onClick={onRemoveAvatar}>
                  Remover
                </Button>
              )}
            </div>
          </div>

          {/* Nome / Apelido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Nome</Label>
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Apelido</Label>
              <Input
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* E-mail + verificação */}
          <div className="space-y-1">
            <Label>E-mail</Label>
            <div className="flex items-center gap-2">
              <Input value={me?.email || ""} readOnly className="bg-muted/50" />
              {me?.email_confirmed ? (
                <span className="text-sm text-green-600">Confirmado</span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSendConfirmation}
                  disabled={sending}
                >
                  {sending ? "A enviar..." : "Confirmar e-mail"}
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Tamanho máx. do avatar: 10MB. Formatos: JPG, PNG, WEBP.
          </p>
        </CardContent>

        <CardFooter className="justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "A guardar..." : "Guardar alterações"}
          </Button>
        </CardFooter>
      </Card>
    </Container>
  );
}
