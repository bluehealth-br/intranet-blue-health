import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Pin } from "lucide-react";
import { MOCK_ANNOUNCEMENTS } from "@/lib/mock-data";
import { formatDateBR, priorityColor, priorityLabel } from "@/lib/helpers";

export default function Comunicados() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight">Comunicados</h1>
        <p className="font-light text-white/80">Comunicados e avisos oficiais da empresa</p>
      </div>

      <div className="space-y-4">
        {MOCK_ANNOUNCEMENTS.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[item.priority]}`}>
                  <Pin className="mr-1 h-3 w-3" strokeWidth={1.5} />
                  {priorityLabel[item.priority]}
                </span>
                <span className="text-xs text-muted-foreground">{formatDateBR(item.date)}</span>
              </div>
              <CardTitle className="text-base font-black text-[#2F3570]">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-light text-muted-foreground">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
