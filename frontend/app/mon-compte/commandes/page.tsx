import { Suspense } from "react";
import OrdersView from "@/components/account/OrdersView";

export default function CommandesPage() {
  return (
    <Suspense fallback={null}>
      <OrdersView />
    </Suspense>
  );
}