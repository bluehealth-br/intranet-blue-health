import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  ListFilter,
  ListOrdered,
  PlusCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Solicitações", url: "/solicitacoes", icon: Inbox },
  { title: "Triagem", url: "/triagem", icon: ListFilter },
  { title: "Fila", url: "/fila", icon: ListOrdered },
  { title: "Nova Solicitação", url: "/nova", icon: PlusCircle },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header — gradiente BH */}
      <div className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-4">
        <BrainCircuit className="h-7 w-7 shrink-0 text-white" strokeWidth={1.5} />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-tight text-white">
              BlueAI
            </span>
            <span className="text-[10px] font-light text-white/80">Projetos & Triagem</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              isActive(item.url)
                ? "bg-[#0D7AB5]/10 font-black text-[#0D7AB5]"
                : "text-[#2F3570] hover:bg-[#F0F0F0] hover:text-[#0D7AB5]",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <NavLink
          to="/configuracoes"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#2F3570] transition-colors hover:bg-[#F0F0F0] hover:text-[#0D7AB5]",
            isActive("/configuracoes") && "bg-[#0D7AB5]/10 font-black text-[#0D7AB5]",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>Configurações</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 flex w-full items-center justify-center rounded-lg p-2 text-[#2F3570]/60 transition-colors hover:bg-[#F0F0F0] hover:text-[#0D7AB5]"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </aside>
  );
}
