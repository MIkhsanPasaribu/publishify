import { Sidebar } from "@/components/dashboard/sidebar";
import { UserHeader } from "@/components/shared/user-header";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 w-full lg:ml-64 transition-all duration-300 overflow-x-hidden">
        <UserHeader userRole="editor" />
        {children}
      </main>
    </div>
  );
}
