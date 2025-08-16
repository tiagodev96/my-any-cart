import { useTranslations } from "next-intl";

export function getErrorMessage(
  err: unknown,
  t: ReturnType<typeof useTranslations>
): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return t("common.generic");
  }
}
