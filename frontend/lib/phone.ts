export function formatInternationalPhone(phone: string, countryCode: string): string {
  return `${countryCode}${phone.replace(/\D/g, "")}`;
}
