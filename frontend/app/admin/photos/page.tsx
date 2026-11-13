"use client";
import RoleGuard from "@/components/admin/RoleGuard";
import PhotoLibrary from "@/components/admin/PhotoLibrary";

export default function AdminPhotos() {
  return (
    <RoleGuard module="photos">
      <PhotoLibrary />
    </RoleGuard>
  );
}
