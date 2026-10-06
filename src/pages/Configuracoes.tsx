import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BrainCircuit, Key } from "lucide-react";

export default function Configuracoes() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight">Configurações</h1>
        <p className="font-light text-white/80">Configurações da plataforma BlueAI</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-black text-[#2F3570]">
            <BrainCircuit className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
            Motor de IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-light text-muted-foreground">
            Atualmente usando análise baseada em regras (simulado). Para ativar a IA real,
            configure a API key abaixo.
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-[#F0F0F0] p-3">
            <Key className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-xs text-muted-foreground">API Key da Anthropic não configurada</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Em breve: conecte com a API do Claude para triagem automática com IA generativa.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-black text-[#2F3570]">
            <Settings className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
            Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-light text-muted-foreground">
            Mais configurações estarão disponíveis em uma versão futura (notificações, integrações, equipe).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
