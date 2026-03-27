import { useState } from "react";

type StatusPiloto = "confirmado" | "pendente";

type PilotoAgendamento = {
  nome: string;
  status: StatusPiloto;
};

type ProximoAgendamento = {
  id: number;
  horario: string;
  bateria: string;
  pilotos: PilotoAgendamento[];
};
const proximosAgendamentos: ProximoAgendamento[] = [
  {
    id: 1,
    horario: "14:00",
    bateria: "Bateria 01",
    pilotos: [
      { nome: "João", status: "confirmado" },
      { nome: "Maria", status: "confirmado" },
      { nome: "Carlos", status: "confirmado" },
      { nome: "Ana", status: "pendente" },
    ],
  },
  {
    id: 2,
    horario: "14:30",
    bateria: "Bateria 02",
    pilotos: [
      { nome: "Bruno", status: "confirmado" },
      { nome: "Fernanda", status: "pendente" },
    ],
  },
  {
    id: 3,
    horario: "15:00",
    bateria: "Bateria 03",
    pilotos: [
      { nome: "Diego", status: "confirmado" },
      { nome: "Luiza", status: "confirmado" },
      { nome: "Marcos", status: "confirmado" },
    ],
  },
  {
    id: 4,
    horario: "15:30",
    bateria: "Bateria 04",
    pilotos: [{ nome: "Rafael", status: "pendente" }],
  },
];

export function Dashboard() {
  // Valores de exemplo; depois podemos integrar com API ou estado real
  const totalAgendamentosHoje = 18;
  const totalBateriasHoje = 9;
  const faturamentoHoje = 3250.5;
  const pilotosCheckin = 27;
  const ocupacaoPista = 72; // porcentagem de ocupação dos horários de hoje
  const mediaPilotosPorBateria = 6.3;
  const totalPilotosEsperados = 40;
  const percentualCheckin = Math.round(
    (pilotosCheckin / totalPilotosEsperados) * 100
  );
  const [linhaExpandida, setLinhaExpandida] = useState<number | null>(null);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Visão geral de hoje</h1>
          <p className="dashboard-subtitle">
            Acompanhe rapidamente o movimento do kartódromo no dia atual.
          </p>
        </div>
        <div className="dashboard-header-info">
          <span>Hoje</span>
        </div>
      </div>

      <section className="dashboard-cards">
        <div className="card">
          <h2>Agendamentos de hoje</h2>
          <p className="card-principal">{totalAgendamentosHoje}</p>
          <span className="card-legenda">Inclui reservas online e presenciais</span>
        </div>

        <div className="card">
          <h2>Número de baterias</h2>
          <p className="card-principal">{totalBateriasHoje}</p>
          <span className="card-legenda">Baterias programadas para hoje</span>
        </div>

        <div className="card">
          <h2>Faturamento do dia</h2>
          <p className="card-principal">
            {faturamentoHoje.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <span className="card-legenda">Ingressos, locação e consumos</span>
        </div>

        <div className="card">
          <h2>Média de pilotos/bateria</h2>
          <p className="card-principal">{mediaPilotosPorBateria}</p>
          <span className="card-legenda">Ajuda a acompanhar a lotação</span>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Próximos agendamentos</h2>
          <span className="dashboard-section-subtitle">
            Lista das próximas baterias com horário e pilotos confirmados.
          </span>
        </div>

        <div className="tabela-agendamentos">
          <div className="tabela-header">
            <span></span>
            <span>Horário</span>
            <span>Bateria</span>
            <span>Pilotos</span>
            <span>Status</span>
          </div>
          {proximosAgendamentos.map((agendamento) => {
            const confirmados = agendamento.pilotos.filter(
              (p) => p.status === "confirmado"
            ).length;
            const pendentes = agendamento.pilotos.filter(
              (p) => p.status === "pendente"
            ).length;

            const expandida = linhaExpandida === agendamento.id;

            return (
              <>
                <div
                  key={agendamento.id}
                  className={
                    "tabela-linha " + (expandida ? "tabela-linha-ativa" : "")
                  }
                >
                  <span
                    className="tabela-expandir-icone"
                    onClick={() =>
                      setLinhaExpandida((atual) =>
                        atual === agendamento.id ? null : agendamento.id
                      )
                    }
                  >
                    {expandida ? "▲" : "▼"}
                  </span>
                  <span>{agendamento.horario}</span>
                  <span>{agendamento.bateria}</span>
                  <span className="tabela-pilotos-resumo">
                    {agendamento.pilotos.length} pilotos
                  </span>
                  <span className="tabela-status-resumo">
                    {confirmados > 0 && (
                      <span className="status-pill status-confirmado">
                        {confirmados} Confirmado
                        {confirmados > 1 ? "s" : ""}
                      </span>
                    )}
                    {pendentes > 0 && (
                      <span className="status-pill status-pendente">
                        {pendentes} Pendente
                        {pendentes > 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                </div>

                {expandida &&
                  agendamento.pilotos.map((piloto, indice) => (
                    <div
                      key={`${agendamento.id}-p-${indice}`}
                      className="tabela-linha tabela-linha-detalhe"
                    >
                      <span></span>
                      <span></span>
                      <span className="tabela-piloto-nome">{piloto.nome}</span>
                      <span>
                        <span
                          className={
                            "status-pill " +
                            (piloto.status === "confirmado"
                              ? "status-confirmado"
                              : "status-pendente")
                          }
                        >
                          {piloto.status === "confirmado"
                            ? "Confirmado"
                            : "Pendente"}
                        </span>
                      </span>
                    </div>
                  ))}
              </>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section dashboard-graficos">
        <div className="dashboard-section-header">
          <h2>Indicadores visuais</h2>
          <span className="dashboard-section-subtitle">
            Gráficos rápidos de check-in e ocupação da pista.
          </span>
        </div>

        <div className="dashboard-graficos-grid">
          <div className="card card-grafico">
            <div className="card-grafico-header">
              <h2>Pilotos com check-in</h2>
              <span className="card-grafico-sub">
                {pilotosCheckin} de {totalPilotosEsperados} pilotos esperados
              </span>
            </div>
            <div className="grafico-checkin">
              <div
                className="grafico-checkin-circulo"
                style={{
                  background: `conic-gradient(#22c55e ${percentualCheckin}%, #e5e7eb 0)` ,
                }}
              >
                <div className="grafico-checkin-inner">
                  <span className="grafico-checkin-numero">
                    {percentualCheckin}%
                  </span>
                </div>
              </div>
              <div className="grafico-checkin-legenda">
                <span>{pilotosCheckin} com check-in</span>
                <span>
                  {totalPilotosEsperados - pilotosCheckin} aguardando check-in
                </span>
              </div>
            </div>
          </div>

          <div className="card card-grafico">
            <div className="card-grafico-header">
              <h2>Ocupação da pista</h2>
              <span className="card-grafico-sub">
                Percentual de horários ocupados hoje
              </span>
            </div>
            <div className="grafico-checkin">
              <div
                className="grafico-checkin-circulo"
                style={{
                  background: `conic-gradient(#22c55e ${ocupacaoPista}%, #e5e7eb 0)` ,
                }}
              >
                <div className="grafico-checkin-inner">
                  <span className="grafico-checkin-numero">
                    {ocupacaoPista}%
                  </span>
                </div>
              </div>
              <div className="grafico-checkin-legenda">
                <span>{ocupacaoPista}% da agenda ocupada</span>
                <span>{100 - ocupacaoPista}% de horários livres</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
