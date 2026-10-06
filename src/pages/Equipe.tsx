import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["employees"]["Row"];

export default function Equipe() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("active", true)
        .order("name");

      if (!active) return;

      if (error) {
        console.error("Erro ao buscar equipe:", error);
        setEmployees([]);
      } else {
        setEmployees(data || []);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const grouped = employees.reduce<Record<string, Employee[]>>((acc, emp) => {
    const dept = emp.department || "Sem departamento";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(emp);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight">Equipe</h1>
        <p className="font-light text-white/80">Colaboradores da Blue Health</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D7AB5] border-t-transparent" />
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Users className="mb-3 h-12 w-12 opacity-50" strokeWidth={1.5} />
            <p className="text-base font-black text-[#2F3570]">Nenhum colaborador cadastrado</p>
            <p className="mt-1 text-sm font-light">
              Cadastre os colaboradores na tabela &quot;employees&quot; do Supabase.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dept, members]) => (
            <Card key={dept}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0D7AB5]" strokeWidth={1.5} />
                  <CardTitle className="text-lg font-black text-[#2F3570]">{dept}</CardTitle>
                  <Badge variant="secondary" className="bg-[#0D7AB5]/10 text-xs text-[#0D7AB5]">
                    {members.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-[#0D7AB5]/30 hover:bg-[#0D7AB5]/5"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={emp.avatar_url || ""} />
                        <AvatarFallback className="bg-[#0D7AB5]/10 text-sm text-[#0D7AB5]">
                          {emp.name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[#2F3570]">{emp.name}</p>
                        {emp.title && (
                          <p className="truncate text-xs font-light text-muted-foreground">{emp.title}</p>
                        )}
                        {emp.email && (
                          <p className="truncate text-xs font-light text-muted-foreground">{emp.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
}
