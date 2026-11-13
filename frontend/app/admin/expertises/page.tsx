"use client";
import RoleGuard from "@/components/admin/RoleGuard";
import ContentModule from "@/components/admin/ContentModule";

export default function Page() {
  return (
    <RoleGuard module="expertises">
      <ContentModule module="expertises" />
    </RoleGuard>
  );
}
