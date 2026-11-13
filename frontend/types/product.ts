export type Stock = "in" | "order" | "out";

export type Product = {
  id: string;
  cat: string;
  name: string;
  price: number;
  stock: Stock;
  photo: string;
  image?: string;
  imageFit?: "cover" | "contain";
  desc: string;
  specs: string[];
};