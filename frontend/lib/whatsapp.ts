const whatsappNumber = "22509223792";

export const whatsappDisplayNumber = "+225 09 22 37 92";

export function whatsappHref(message?: string) {
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${whatsappNumber}${query}`;
}
