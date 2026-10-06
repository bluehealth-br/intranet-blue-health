import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cake, CalendarDays, PartyPopper } from "lucide-react";
import { useBirthdays } from "@/hooks/useBirthdays";
import { formatBirthday, isBirthdayToday } from "@/lib/helpers";

export default function Aniversariantes() {
  const { birthdays, loading } = useBirthdays();
  const currentMonthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight">Aniversariantes</h1>
        <p className="font-light text-white/80">
          Aniversariantes de {currentMonthName} — parabenize seus colegas!
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-[#0D7AB5]" strokeWidth={1.5} />
            <CardTitle className="text-lg font-black text-[#2F3570]">
              {currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D7AB5] border-t-transparent" />
            </div>
          ) : birthdays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <PartyPopper className="mb-3 h-12 w-12 opacity-50" strokeWidth={1.5} />
              <p className="text-base font-black text-[#2F3570]">Nenhum aniversariante este mês</p>
              <p className="mt-1 text-sm font-light">
                Cadastre as datas de nascimento dos colaboradores na página de Equipe.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {birthdays.map((person) => (
                <div
                  key={person.id}
                  className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${
                    isBirthdayToday(person.birth_date)
                      ? "bg-[#20DAFE]/10 ring-1 ring-[#20DAFE]/30"
                      : "hover:bg-[#F0F0F0]"
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={person.avatar_url || ""} />
                    <AvatarFallback className="bg-[#0D7AB5]/10 text-[#0D7AB5]">
                      {person.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#2F3570]">{person.name}</span>
                      {isBirthdayToday(person.birth_date) && (
                        <Badge className="bg-[#20DAFE] text-xs text-white hover:bg-[#20DAFE]">
                          Hoje!
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-light text-muted-foreground">
                      {person.title && <span>{person.title}</span>}
                      {person.title && person.department && <span>·</span>}
                      {person.department && <span>{person.department}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
                    <span>{formatBirthday(person.birth_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
