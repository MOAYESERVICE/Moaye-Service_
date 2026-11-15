import "../portal.css";
import { AdminProvider } from "@/hooks/useAdmin";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import ToastBar from "@/components/admin/ToastBar";

export const metadata = { title: "Administration — MOAYE SERVICES" };
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="pt-app">
        <Sidebar />
        <div className="pt-main">
          <TopBar />
          <div className="pt-content">
            <ToastBar />
            {children}
          </div>
        </div>
      </div>
    </AdminProvider>
  );
}
