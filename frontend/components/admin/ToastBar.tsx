"use client";
import { useAdmin } from "@/hooks/useAdmin";

export default function ToastBar() {
  const { toast } = useAdmin();
  if (!toast) return null;
  return <div className="toast" role="status">{toast}</div>;
}