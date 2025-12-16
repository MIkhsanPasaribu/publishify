import { SidebarAdmin } from "@/components/dashboard/sidebar-admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 md:ml-72 overflow-auto transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
