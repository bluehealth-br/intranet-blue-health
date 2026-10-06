import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, ExternalLink } from "lucide-react";
import { COMPANY_SYSTEMS } from "@/lib/mock-data";

export default function Sistemas() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight">Sistemas</h1>
        <p className="font-light text-white/80">Acesse os sistemas utilizados na empresa</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-[#0D7AB5]" strokeWidth={1.5} />
            <CardTitle className="text-lg font-black text-[#2F3570]">Sistemas disponíveis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANY_SYSTEMS.map((sys) => (
              <a
                key={sys.id}
                href={sys.url}
                target={sys.internal ? "_self" : "_blank"}
                rel={sys.internal ? undefined : "noopener noreferrer"}
                className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-[#0D7AB5]/30 hover:bg-[#0D7AB5]/5"
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] text-white">
                  <Monitor className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-[#2F3570]">{sys.name}</span>
                    {!sys.internal && (
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
                    )}
                  </div>
                  <p className="mt-1 text-xs font-light text-muted-foreground">{sys.description}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
