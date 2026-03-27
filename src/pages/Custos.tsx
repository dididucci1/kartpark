import { useState } from "react";

export type CustoCategoria = "Combustível" | "Manutenção" | "Equipe" | "Outros";

export type LancamentoCusto = {
  id: number;
  data: string;
  descricao: string;
  categoria: CustoCategoria;
  valor: number;
};

const lancamentosIniciais: LancamentoCusto[] = [
  {
    id: 1,
    data: "2026-03-26",
    descricao: "Abastecimento karts - tarde",
    categoria: "Combustível",
    valor: 750,
  },
  {
    id: 2,
    data: "2026-03-26",
    descricao: "Troca de pneus",
    categoria: "Manutenção",
    valor: 520,
  },
  {
    id: 3,
    data: "2026-03-27",
    descricao: "Equipe operação pista",
    categoria: "Equipe",
    valor: 950,
  },
  {
    id: 4,
    data: "2026-03-27",
    descricao: "Limpeza área comum",
    categoria: "Outros",
    valor: 180,
  },
];

export function Custos() {
  const [lancamentos] = useState<LancamentoCusto[]>(lancamentosIniciais);

  const totalPeriodo = lancamentos.reduce((total, l) => total + l.valor, 0);
  const totalPorCategoria: Record<CustoCategoria, number> = {
    Combustível: 0,
    Manutenção: 0,
    Equipe: 0,
    Outros: 0,
  };

  lancamentos.forEach((l) => {
    totalPorCategoria[l.categoria] += l.valor;
  });

  return (
    <div className="custos">
      <header className="custos-header">
        <div>
          <h1>Custos operacionais</h1>
          <p className="custos-subtitle">
            Acompanhe os principais custos por categoria e por dia.
          </p>
        </div>
      </header>

      <section className="custos-cards">
        <div className="card">
          <h2>Custo total do período</h2>
          <p className="card-principal">
            R$ {totalPeriodo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <span className="card-legenda">Soma de todos os lançamentos listados</span>
        </div>

        <div className="card">
          <h2>Combustível</h2>
          <p className="card-principal">
            R$ {totalPorCategoria["Combustível"].toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <span className="card-legenda">Abastecimento e combustíveis</span>
        </div>

        <div className="card">
          <h2>Manutenção</h2>
          <p className="card-principal">
            R$ {totalPorCategoria["Manutenção"].toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <span className="card-legenda">Peças, ajustes e revisões</span>
        </div>

        <div className="card">
          <h2>Equipe</h2>
          <p className="card-principal">
            R$ {totalPorCategoria["Equipe"].toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <span className="card-legenda">Instrutores, mecânicos e apoio</span>
        </div>
      </section>

      <section className="dashboard-section custos-lista">
        <div className="dashboard-section-header">
          <h2>Lançamentos recentes</h2>
          <span className="dashboard-section-subtitle">
            Registro simples dos custos mais recentes.
          </span>
        </div>

        <div className="custos-tabela">
          <div className="custos-tabela-header">
            <span>Data</span>
            <span>Descrição</span>
            <span>Categoria</span>
            <span>Valor</span>
          </div>
          {lancamentos.map((lancamento) => (
            <div key={lancamento.id} className="custos-tabela-linha">
              <span>
                {new Date(lancamento.data + "T00:00").toLocaleDateString(
                  "pt-BR"
                )}
              </span>
              <span>{lancamento.descricao}</span>
              <span>{lancamento.categoria}</span>
              <span>
                R$ {lancamento.valor.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
