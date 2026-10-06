import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useSubmissions } from "@/lib/store";
import { Loader2 } from "lucide-react";

export function AppLayout() {
  const fetchSubmissions = useSubmissions((s) => s.fetchSubmissions);
  const loading = useSubmissions((s) => s.loading);
  const error = useSubmissions((s) => s.error);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-[#0D7AB5]" strokeWidth={1.5} />
              <p className="text-sm font-light">Carregando solicitações...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-700">Erro ao conectar</p>
              <p className="mt-1 text-xs text-red-600">{error}</p>
              <button
                onClick={() => fetchSubmissions()}
                className="mt-3 rounded-md bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
