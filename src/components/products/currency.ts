export const eur = (value: number, locale = "pt-PT") =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
    value
  );
