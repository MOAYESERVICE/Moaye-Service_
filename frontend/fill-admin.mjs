import { mkdirSync, writeFileSync } from "node:fs";

const modules = [
  ["categories", "categories"],
  ["services", "services"],
  ["expertises", "expertises"],
  ["realisations", "realisations"],
  ["partenaires", "partenaires"],
];

for (const [dir, id] of modules) {
  mkdirSync(`app/admin/${dir}`, { recursive: true });
  writeFileSync(
    `app/admin/${dir}/page.tsx`,
    `"use client";
import RoleGuard from "@/components/admin/RoleGuard";
import ContentModule from "@/components/admin/ContentModule";

export default function Page() {
  return (
    <RoleGuard module="${id}">
      <ContentModule module="${id}" />
    </RoleGuard>
  );
}
`
  );
}
console.log("Modules créés.");