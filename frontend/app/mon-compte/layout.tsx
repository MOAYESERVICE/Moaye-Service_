import "../portal.css";
import { Suspense } from "react";
import { AccountProvider } from "@/hooks/useAccount";
import AccountSidebar from "@/components/account/AccountSidebar";
import AccountTopBar from "@/components/account/AccountTopBar";

export const metadata = { title: "Espace client — MOAYE SERVICES" };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <div className="pt-app">
        <Suspense fallback={<aside className="pt-side dark account-side" aria-hidden="true" />}>
          <AccountSidebar />
        </Suspense>
        <div className="pt-main">
          <Suspense fallback={<header className="pt-top" aria-hidden="true" />}>
            <AccountTopBar />
          </Suspense>
          <div className="pt-content">
            <Suspense fallback={<div className="pt-panel pt-pp" role="status">Chargement de votre espace client…</div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </AccountProvider>
  );
}
