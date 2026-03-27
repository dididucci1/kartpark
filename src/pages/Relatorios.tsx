import { useState } from "react";

type ResumoFinanceiro = {
  agendamentos: number;
  faturamentoBruto: number;
  custosOperacionais: number;
  lucroEstimado: number;
};

type DiaFinanceiro = {
  data: string;
  agendamentos: number;
  faturamento: number;
  custos: number;
};

const resumoHoje: ResumoFinanceiro = {
  agendamentos: 42,
  faturamentoBruto: 7800,
  custosOperacionais: 3200,
  lucroEstimado: 4600,
};

const dadosPeriodoPadrao: DiaFinanceiro[] = [
  { data: "2026-03-24", agendamentos: 35, faturamento: 6200, custos: 2800 },
  { data: "2026-03-25", agendamentos: 40, faturamento: 7100, custos: 3000 },
  { data: "2026-03-26", agendamentos: 38, faturamento: 6950, custos: 2950 },
  { data: "2026-03-27", agendamentos: 42, faturamento: 7800, custos: 3200 },
];

export function Relatorios() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<"resumo" | "custos">("resumo");

  const dadosPeriodo = dadosPeriodoPadrao;

  const totalAgendamentosPeriodo = dadosPeriodo.reduce(
    (total, dia) => total + dia.agendamentos,
    0
  );

  const faturamentoPeriodo = dadosPeriodo.reduce(
    (total, dia) => total + dia.faturamento,
    0
  );

  const custosPeriodo = dadosPeriodo.reduce(
    (total, dia) => total + dia.custos,
    0
  );

  const lucroPeriodo = faturamentoPeriodo - custosPeriodo;

  const ticketMedio =
    totalAgendamentosPeriodo > 0
      ? faturamentoPeriodo / totalAgendamentosPeriodo
      : 0;

  return (
    <div className="dashboard-financeiro">
      <div className="dashboard-financeiro-header">
        <div>
          <h1>Dashboard Financeiro</h1>
          <p className="dashboard-financeiro-subtitle">
            Visão consolidada de agendamentos, faturamento e custos no período.
          </p>
        </div>

        <div className="dashboard-financeiro-filtros">
          <div className="campo-form">
            <label htmlFor="data-inicio">Início</label>
            <input
              id="data-inicio"
              type="date"
              value={dataInicio}
              onChange={(event) => setDataInicio(event.target.value)}
            />
          </div>

          <div className="campo-form">
            <label htmlFor="data-fim">Fim</label>
            <input
              id="data-fim"
              type="date"
              value={dataFim}
              onChange={(event) => setDataFim(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-financeiro-abas">
        <button
          type="button"
          className={
            abaAtiva === "resumo"
              ? "dashboard-financeiro-aba ativo"
              : "dashboard-financeiro-aba"
          }
          onClick={() => setAbaAtiva("resumo")}
        >
          Resumo do período
        </button>
        <button
          type="button"
          className={
            abaAtiva === "custos"
              ? "dashboard-financeiro-aba ativo"
              : "dashboard-financeiro-aba"
          }
          onClick={() => setAbaAtiva("custos")}
        >
          Custos detalhados
        </button>
      </div>

      {abaAtiva === "resumo" && (
        <>
          <section className="dashboard-financeiro-cards">
            <div className="card">
              <h2>Agendamentos no período</h2>
              <p className="card-principal">{totalAgendamentosPeriodo}</p>
              <span className="card-legenda">
                Hoje: {resumoHoje.agendamentos} agendamentos
              </span>
            </div>

            <div className="card">
              <h2>Faturamento bruto</h2>
              <p className="card-principal">
                R$ {faturamentoPeriodo.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <span className="card-legenda">
                Hoje: R$ {resumoHoje.faturamentoBruto.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="card">
              <h2>Custos operacionais</h2>
              <p className="card-principal">
                R$ {custosPeriodo.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <span className="card-legenda">
                Hoje: R$ {resumoHoje.custosOperacionais.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="card">
              <h2>Lucro estimado</h2>
              <p className="card-principal">
                R$ {lucroPeriodo.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <span className="card-legenda">
                Hoje: R$ {resumoHoje.lucroEstimado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="card">
              <h2>Ticket médio</h2>
              <p className="card-principal">
                R$ {ticketMedio.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <span className="card-legenda">
                Faturamento por agendamento
              </span>
            </div>
          </section>

          <section className="dashboard-section dashboard-financeiro-tabela">
            <div className="dashboard-section-header">
              <h2>Detalhamento diário</h2>
              <span className="dashboard-section-subtitle">
                Agendamentos, faturamento e custos dia a dia.
              </span>
            </div>

            <div className="dashboard-financeiro-tabela-lista">
              <div className="dashboard-financeiro-tabela-header">
                <span>Data</span>
                <span>Agendamentos</span>
                <span>Faturamento</span>
                <span>Custos</span>
                <span>Lucro</span>
              </div>
              {dadosPeriodo.map((dia) => {
                const lucroDia = dia.faturamento - dia.custos;
                return (
                  <div
                    key={dia.data}
                    className="dashboard-financeiro-tabela-linha"
                  >
                    <span>
                      {new Date(dia.data + "T00:00").toLocaleDateString("pt-BR")}
                    </span>
                    <span>{dia.agendamentos}</span>
                    <span>
                      R$ {dia.faturamento.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span>
                      R$ {dia.custos.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span>
                      R$ {lucroDia.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {abaAtiva === "custos" && (
        <section className="dashboard-section dashboard-financeiro-custos">
          <div className="dashboard-section-header">
            <h2>Custos por categoria</h2>
            <span className="dashboard-section-subtitle">
              Distribuição estimada dos custos operacionais.
            </span>
          </div>

          <div className="dashboard-financeiro-custos-grid">
            <div className="card">
              <h2>Combustível</h2>
              <p className="card-principal">R$ 1.800,00</p>
              <span className="card-legenda">Abastecimento dos karts no período</span>
            </div>

            <div className="card">
              <h2>Manutenção</h2>
              <p className="card-principal">R$ 750,00</p>
              <span className="card-legenda">Peças, ajustes e revisões</span>
            </div>

            <div className="card">
              <h2>Equipe</h2>
              <p className="card-principal">R$ 1.900,00</p>
              <span className="card-legenda">Instrutores, mecânicos e apoio</span>
            </div>

            <div className="card">
              <h2>Outros custos</h2>
              <p className="card-principal">R$ 850,00</p>
              <span className="card-legenda">Marketing, limpeza e diversos</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
