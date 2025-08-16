export const POPULAR_CURRENCIES = [
  "USD", // American Dollar
  "EUR", // Euro
  "CNY", // Chinese Yuan
  "JPY", // Japanese Yen
  "GBP", // British Pound
  "INR", // Indian Rupee
  "BRL", // Brazilian Real
  "AUD", // Australian Dollar
  "CAD", // Canadian Dollar
  "CHF", // Swiss Franc
  "MXN", // Mexican Peso
  "KRW", // South Korean Won
  "TRY", // Turkish Lira
  "ZAR", // South African Rand
];

export function getCurrencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return parts?.value ?? currency;
  } catch {
    return currency;
  }
}

export function formatMoney(
  value: number,
  currency: string,
  locale?: string
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${getCurrencySymbol(currency)} ${value.toFixed(2)}`;
  }
}
