import { HashRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Solicitacoes from "@/pages/Solicitacoes";
import Triagem from "@/pages/Triagem";
import NovaSolicitacao from "@/pages/NovaSolicitacao";
import DetalhesSolicitacao from "@/pages/DetalhesSolicitacao";
import Configuracoes from "@/pages/Configuracoes";
import Fila from "@/pages/Fila";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/solicitacoes" element={<Solicitacoes />} />
          <Route path="/solicitacoes/:id" element={<DetalhesSolicitacao />} />
          <Route path="/triagem" element={<Triagem />} />
          <Route path="/fila" element={<Fila />} />
          <Route path="/nova" element={<NovaSolicitacao />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
