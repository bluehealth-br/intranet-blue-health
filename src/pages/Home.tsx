import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Megaphone,
  Monitor,
  Cake,
  ExternalLink,
  PartyPopper,
  CalendarDays,
  Pin,
  ArrowRight,
} from "lucide-react";
import { MOCK_NEWS, MOCK_ANNOUNCEMENTS, COMPANY_SYSTEMS } from "@/lib/mock-data";
import { useBirthdays } from "@/hooks/useBirthdays";
import { formatDateBR, formatBirthday, priorityColor, priorityLabel, isBirthdayToday } from "@/lib/helpers";
import { NewsCarousel } from "@/components/crm/NewsCarousel";

export default function Home() {
  const { birthdays, loading: loadingBirthdays } = useBirthdays();
  const currentMonthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header com gradiente */}
      <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <img src="/logo-white-crop.png" alt="Blue Health" className="h-10 w-auto" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Intranet</h1>
          <p className="font-light text-white/80">Portal interno Blue Health</p>
        </div>
      </div>

      {/* Carrossel de notícias — full width */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span />
          <Link
            to="/noticias"
            className="flex items-center gap-1 text-xs font-medium text-[#0D7AB5] hover:underline"
          >
            Ver todas <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </div>
        <NewsCarousel news={MOCK_NEWS} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Comunicados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[#0D7AB5]" strokeWidth={1.5} />
              <CardTitle className="text-lg font-black text-[#2F3570]">Comunicados</CardTitle>
            </div>
            <Link to="/comunicados" className="flex items-center gap-1 text-xs font-medium text-[#0D7AB5] hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_ANNOUNCEMENTS.slice(0, 3).map((item) => (
              <div key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[item.priority]}`}>
                    <Pin className="mr-1 h-3 w-3" strokeWidth={1.5} />
                    {priorityLabel[item.priority]}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDateBR(item.date)}</span>
                </div>
                <h3 className="text-sm font-black leading-snug text-[#2F3570]">{item.title}</h3>
                <p className="mt-1 text-sm font-light text-muted-foreground">{item.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sistemas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-[#0D7AB5]" strokeWidth={1.5} />
              <CardTitle className="text-lg font-black text-[#2F3570]">Sistemas</CardTitle>
            </div>
            <Link to="/sistemas" className="flex items-center gap-1 text-xs font-medium text-[#0D7AB5] hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {COMPANY_SYSTEMS.slice(0, 4).map((sys) => (
                <a
                  key={sys.id}
                  href={sys.url}
                  target={sys.internal ? "_self" : "_blank"}
                  rel={sys.internal ? undefined : "noopener noreferrer"}
                  className="group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:border-[#0D7AB5]/30 hover:bg-[#0D7AB5]/5"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] text-white">
                    <Monitor className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-[#2F3570]">{sys.name}</span>
                      {!sys.internal && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
                      )}
                    </div>
                    <p className="text-xs font-light text-muted-foreground">{sys.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aniversariantes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-[#0D7AB5]" strokeWidth={1.5} />
              <CardTitle className="text-lg font-black text-[#2F3570]">
                Aniversariantes de {currentMonthName}
              </CardTitle>
            </div>
            <Link to="/aniversariantes" className="flex items-center gap-1 text-xs font-medium text-[#0D7AB5] hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </CardHeader>
          <CardContent>
            {loadingBirthdays ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D7AB5] border-t-transparent" />
              </div>
            ) : birthdays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <PartyPopper className="mb-2 h-8 w-8 opacity-50" strokeWidth={1.5} />
                <p className="text-sm">Nenhum aniversariante este mês</p>
                <p className="mt-1 text-xs font-light">Cadastre as datas na página de Equipe.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {birthdays.slice(0, 6).map((person) => (
                  <div
                    key={person.id}
                    className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                      isBirthdayToday(person.birth_date)
                        ? "bg-[#20DAFE]/10 ring-1 ring-[#20DAFE]/30"
                        : "hover:bg-[#F0F0F0]"
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={person.avatar_url || ""} />
                      <AvatarFallback className="bg-[#0D7AB5]/10 text-sm text-[#0D7AB5]">
                        {person.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-black text-[#2F3570]">{person.name}</span>
                        {isBirthdayToday(person.birth_date) && (
                          <Badge className="bg-[#20DAFE] text-xs text-white hover:bg-[#20DAFE]">
                            Hoje!
                          </Badge>
                        )}
                      </div>
                      {person.title && (
                        <p className="truncate text-xs font-light text-muted-foreground">{person.title}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{formatBirthday(person.birth_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
