import "../portal.css";
import { AccountProvider } from "@/hooks/useAccount";
import AccountSidebar from "@/components/account/AccountSidebar";
import AccountTopBar from "@/components/account/AccountTopBar";

export const metadata = { title: "Espace client — MOAYE SERVICES" };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <div className="pt-app">
        <AccountSidebar />
        <div className="pt-main">
          <AccountTopBar />
          <div className="pt-content">{children}</div>
        </div>
      </div>
    </AccountProvider>
  );
}