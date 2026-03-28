import { Sidebar } from "@/components/admin/sidebar";
import { Navbar } from "@/components/admin/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8 pt-24 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
