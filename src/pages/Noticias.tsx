import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink } from "lucide-react";
import { MOCK_NEWS } from "@/lib/mock-data";
import { formatDateBR } from "@/lib/helpers";

export default function Noticias() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight">Notícias</h1>
        <p className="font-light text-white/80">Fique por dentro do que acontece no setor de saúde</p>
      </div>

      <div className="space-y-4">
        {MOCK_NEWS.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="transition-colors hover:border-[#0D7AB5]/30 hover:bg-[#0D7AB5]/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
                  <Badge variant="secondary" className="bg-[#0D7AB5]/10 text-xs text-[#0D7AB5]">
                    {item.category}
                  </Badge>
                  <span className="text-xs font-medium text-[#2F3570]">{item.source}</span>
                  <span className="text-xs text-muted-foreground">{formatDateBR(item.date)}</span>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-base font-black text-[#2F3570]">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-light text-muted-foreground">{item.summary}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
