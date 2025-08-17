"use client";

import { http } from "@/lib/http";

export type Me = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  is_staff: boolean;
  email_confirmed: boolean;
};

export async function getMe(): Promise<Me> {
  return await http<Me>("/api/me/", { auth: true });
}

export async function updateMe(payload: {
  first_name?: string;
  last_name?: string;
  avatar?: File | null;
}): Promise<Me> {
  const form = new FormData();
  if (payload.first_name !== undefined)
    form.append("first_name", payload.first_name);
  if (payload.last_name !== undefined)
    form.append("last_name", payload.last_name);
  if (payload.avatar !== undefined) {
    if (payload.avatar === null) {
      form.append("avatar", "");
    } else {
      form.append("avatar", payload.avatar);
    }
  }
  return await http<Me>("/api/me/", {
    method: "PATCH",
    body: form,
    auth: true,
  });
}

export async function sendConfirmationEmail(): Promise<{ detail: string }> {
  return await http<{ detail: string }>("/api/auth/send-confirmation-email/", {
    method: "POST",
    auth: true,
  });
}
