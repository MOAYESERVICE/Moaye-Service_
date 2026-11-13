"use client";
import RoleGuard from "@/components/admin/RoleGuard";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminHome() {
  return (
    <RoleGuard module="dash">
      <AdminDashboard />
    </RoleGuard>
  );
}