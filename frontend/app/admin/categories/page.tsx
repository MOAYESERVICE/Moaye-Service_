"use client";
import RoleGuard from "@/components/admin/RoleGuard";
import ContentModule from "@/components/admin/ContentModule";

export default function Page() {
  return (
    <RoleGuard module="categories">
      <ContentModule module="categories" />
    </RoleGuard>
  );
}
