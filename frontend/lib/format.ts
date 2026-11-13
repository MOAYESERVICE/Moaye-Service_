export const fcfa = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

export const norm = (t: string) =>
  String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");