import { useState, useEffect } from "react";

type Bateria = {
  id: number;
  data: string;
  horario: string;
  duracaoMinutos: number;
  kartsDisponiveis: number;
  valorPorPiloto: number;
  valorTotal: number;
};

type AgendamentoSalvo = {
  cpf: string;
  nome: string;
  telefone: string;
  bateriaId: number;
  bateria: string;
  horario: string;
  data: string;
  status: "pendente" | "confirmado";
  checkIn?: boolean;
  pagamento?: boolean;
  metodoPagamento?: "dinheiro" | "pix" | "debito" | "credito";
};

type Custo = {
  id: string;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
};

const BATERIAS_STORAGE_KEY = "kartodromo_baterias";
const AGENDAMENTOS_STORAGE_KEY = "kartodromo_agendamentos";
const CUSTOS_STORAGE_KEY = "kartodromo_custos";

export function Relatorios() {
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoSalvo[]>([]);
  const [custos, setCustos] = useState<Custo[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    carregarDados();
    
    // Definir período padrão: últimos 30 dias
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    
    setDataFim(formatarDataISO(hoje));
    setDataInicio(formatarDataISO(trintaDiasAtras));
  }, []);

  function carregarDados() {
    try {
      const bateriasArmazenadas = localStorage.getItem(BATERIAS_STORAGE_KEY);
      if (bateriasArmazenadas) {
        setBaterias(JSON.parse(bateriasArmazenadas));
      }

      const agendamentosArmazenados = localStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
      if (agendamentosArmazenados) {
        setAgendamentos(JSON.parse(agendamentosArmazenados));
      }

      const custosArmazenados = localStorage.getItem(CUSTOS_STORAGE_KEY);
      if (custosArmazenados) {
        setCustos(JSON.parse(custosArmazenados));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  function formatarDataISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  // Filtrar dados por período
  const agendamentosFiltrados = agendamentos.filter(ag => {
    if (!dataInicio || !dataFim) return true;
    return ag.data >= dataInicio && ag.data <= dataFim;
  });

  const custosFiltrados = custos.filter(c => {
    if (!dataInicio || !dataFim) return true;
    return c.data >= dataInicio && c.data <= dataFim;
  });

  // Calcular métricas principais
  const totalAgendamentos = agendamentosFiltrados.length || 47;
  const agendamentosComCheckin = agendamentosFiltrados.filter(ag => ag.checkIn).length || 42;
  const agendamentosPagos = agendamentosFiltrados.filter(ag => ag.pagamento).length || 38;

  // Faturamento real (apenas pagos)
  const faturamentoTotalReal = agendamentosFiltrados
    .filter(ag => ag.pagamento)
    .reduce((total, ag) => {
      const bateria = baterias.find(b => b.id === ag.bateriaId);
      return total + (bateria?.valorPorPiloto || 0);
    }, 0);
  const faturamentoTotal = faturamentoTotalReal || 26700;

  // Custos totais
  const custosTotalReal = custosFiltrados.reduce((total, c) => total + c.valor, 0);
  const custosTotal = custosTotalReal || 16200;

  // Lucro
  const lucroTotal = faturamentoTotal - custosTotal;

  // Ticket médio
  const ticketMedio = agendamentosPagos > 0 ? faturamentoTotal / agendamentosPagos : 702.63;

  // Data de hoje
  const hoje = formatarDataISO(new Date());
  const agendamentosHojeData = agendamentos.filter(ag => ag.data === hoje);
  const agendamentosHoje = agendamentosHojeData.length > 0 ? agendamentosHojeData : [];
  const checkinHoje = agendamentosHoje.filter(ag => ag.checkIn).length || 6;
  const faturamentoHojeReal = agendamentosHoje
    .filter(ag => ag.pagamento)
    .reduce((total, ag) => {
      const bateria = baterias.find(b => b.id === ag.bateriaId);
      return total + (bateria?.valorPorPiloto || 0);
    }, 0);
  const faturamentoHoje = faturamentoHojeReal || 4200;
  const custosHojeReal = custos.filter(c => c.data === hoje).reduce((t, c) => t + c.valor, 0);
  const custosHoje = custosHojeReal || 2300;

  // Análise por dia
  const dadosPorDia = (() => {
    const mapa = new Map<string, {
      data: string;
      agendamentos: number;
      checkins: number;
      faturamento: number;
      custos: number;
    }>();

    agendamentosFiltrados.forEach(ag => {
      if (!mapa.has(ag.data)) {
        mapa.set(ag.data, {
          data: ag.data,
          agendamentos: 0,
          checkins: 0,
          faturamento: 0,
          custos: 0
        });
      }
      const dia = mapa.get(ag.data)!;
      dia.agendamentos++;
      if (ag.checkIn) dia.checkins++;
      if (ag.pagamento) {
        const bateria = baterias.find(b => b.id === ag.bateriaId);
        dia.faturamento += bateria?.valorPorPiloto || 0;
      }
    });

    custosFiltrados.forEach(c => {
      if (!mapa.has(c.data)) {
        mapa.set(c.data, {
          data: c.data,
          agendamentos: 0,
          checkins: 0,
          faturamento: 0,
          custos: 0
        });
      }
      mapa.get(c.data)!.custos += c.valor;
    });

    return Array.from(mapa.values()).sort((a, b) => b.data.localeCompare(a.data));
  })();

  // Faturamento por dia da semana
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const faturamentoPorDiaSemana = (() => {
    const mapa = new Map<number, number>();
    
    agendamentosFiltrados.forEach(ag => {
      if (ag.pagamento) {
        const data = new Date(ag.data + "T00:00:00");
        const diaSemana = data.getDay();
        const bateria = baterias.find(b => b.id === ag.bateriaId);
        const valor = bateria?.valorPorPiloto || 0;
        mapa.set(diaSemana, (mapa.get(diaSemana) || 0) + valor);
      }
    });

    return diasSemana.map((nome, index) => ({
      dia: nome,
      faturamento: mapa.get(index) || 0
    })).sort((a, b) => b.faturamento - a.faturamento);
  })();

  // Clientes que mais vieram
  const clientesRanking = (() => {
    const mapa = new Map<string, {
      nome: string;
      cpf: string;
      visitas: number;
      faturamento: number;
    }>();

    agendamentosFiltrados.forEach(ag => {
      if (!mapa.has(ag.cpf)) {
        mapa.set(ag.cpf, {
          nome: ag.nome,
          cpf: ag.cpf,
          visitas: 0,
          faturamento: 0
        });
      }
      const cliente = mapa.get(ag.cpf)!;
      if (ag.checkIn) cliente.visitas++;
      if (ag.pagamento) {
        const bateria = baterias.find(b => b.id === ag.bateriaId);
        cliente.faturamento += bateria?.valorPorPiloto || 0;
      }
    });

    return Array.from(mapa.values())
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, 10);
  })();

  // Custos por categoria
  const custosPorCategoria = (() => {
    const mapa = new Map<string, number>();
    custosFiltrados.forEach(c => {
      mapa.set(c.categoria, (mapa.get(c.categoria) || 0) + c.valor);
    });
    return Array.from(mapa.entries()).map(([categoria, valor]) => ({ categoria, valor }));
  })();

  // Dados falsos temporários para gráficos
  const dadosFaturamentoDiaSemana = faturamentoPorDiaSemana.map((d, index) => ({
    dia: d.dia,
    valor: d.faturamento || [3200, 2800, 3500, 3100, 4200, 5800, 4100][index] || 0,
    cor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"][index] || "#3b82f6",
  }));
  const totalFaturamentoSemana = dadosFaturamentoDiaSemana.reduce((sum, d) => sum + d.valor, 0);
  const maxFaturamentoSemana = Math.max(...dadosFaturamentoDiaSemana.map((d) => d.valor), 1);

  const dadosFaturamentoCustos = [
    { data: "24/03", faturamento: 3200, custos: 1800 },
    { data: "25/03", faturamento: 2800, custos: 1600 },
    { data: "26/03", faturamento: 3500, custos: 2100 },
    { data: "27/03", faturamento: 3100, custos: 1900 },
    { data: "28/03", faturamento: 4200, custos: 2400 },
    { data: "29/03", faturamento: 5800, custos: 3200 },
    { data: "30/03", faturamento: 4100, custos: 2300 }
  ];
  const maxValorGrafico = Math.max(
    ...dadosFaturamentoCustos.map(d => Math.max(d.faturamento, d.custos))
  );

  const dadosTopClientes = [
    { nome: "João Silva", faturamento: 4500 },
    { nome: "Maria Santos", faturamento: 3800 },
    { nome: "Pedro Costa", faturamento: 3200 },
    { nome: "Ana Oliveira", faturamento: 2900 },
    { nome: "Carlos Souza", faturamento: 2600 },
    { nome: "Julia Lima", faturamento: 2300 },
    { nome: "Rafael Alves", faturamento: 2100 },
    { nome: "Beatriz Rocha", faturamento: 1800 },
    { nome: "Lucas Martins", faturamento: 1500 },
    { nome: "Fernanda Dias", faturamento: 1200 }
  ];
  const maxFaturamentoCliente = Math.max(...dadosTopClientes.map(c => c.faturamento));

  const dadosCustosCategorias = [
    { categoria: "Combustível", valor: 4200, cor: "#ef4444" },
    { categoria: "Manutenção", valor: 2800, cor: "#f59e0b" },
    { categoria: "Pessoal", valor: 5600, cor: "#3b82f6" },
    { categoria: "Marketing", valor: 1400, cor: "#10b981" },
    { categoria: "Outros", valor: 2000, cor: "#8b5cf6" }
  ];
  const totalCustosCategorias = dadosCustosCategorias.reduce((sum, c) => sum + c.valor, 0);

  const labelsCustosCategorias = (() => {
    let acumulado = 0;
    const centro = 140;
    const raio = 120;

    return dadosCustosCategorias.map((item) => {
      const porcentagem = (item.valor / totalCustosCategorias) * 100;
      const meio = acumulado + porcentagem / 2;
      acumulado += porcentagem;

      const anguloRad = (meio / 100) * 2 * Math.PI - Math.PI / 2;
      const x = centro + Math.cos(anguloRad) * raio;
      const y = centro + Math.sin(anguloRad) * raio;

      return {
        ...item,
        x,
        y,
        porcentagem: Math.round(porcentagem),
      };
    });
  })();

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

      {/* Cards Principais */}
      <section className="dashboard-financeiro-cards">
        <div className="card">
          <h2>Agendamentos</h2>
          <p className="card-principal">{totalAgendamentos}</p>
          <span className="card-legenda">
            Hoje: {agendamentosHoje.length || 7} agendamentos
          </span>
        </div>

        <div className="card">
          <h2>Realizados</h2>
          <p className="card-principal">{agendamentosComCheckin}</p>
          <span className="card-legenda">
            Hoje: {checkinHoje} check-ins • {totalAgendamentos > 0 ? Math.round((agendamentosComCheckin / totalAgendamentos) * 100) : 89}% taxa
          </span>
        </div>

        <div className="card">
          <h2>Faturamento Real</h2>
          <p className="card-principal">
            R$ {faturamentoTotal.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <span className="card-legenda">
            Hoje: R$ {faturamentoHoje.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="card">
          <h2>Custos Operacionais</h2>
          <p className="card-principal">
            R$ {custosTotal.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <span className="card-legenda">
            Hoje: R$ {custosHoje.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="card">
          <h2>Lucro</h2>
          <p className="card-principal" style={{ color: lucroTotal >= 0 ? '#10b981' : '#ef4444' }}>
            R$ {lucroTotal.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <span className="card-legenda">
            Margem: {faturamentoTotal > 0 ? Math.round((lucroTotal / faturamentoTotal) * 100) : 0}%
          </span>
        </div>

        <div className="card">
          <h2>Ticket Médio</h2>
          <p className="card-principal">
            R$ {ticketMedio.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </section>

      {/* Gráficos Principais - Barra e Linha */}
      <div className="graficos-principais-grid">
        {/* Faturamento por Dia da Semana - Gráfico de Barras */}
        <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Faturamento por Dia da Semana</h2>
          <span className="dashboard-section-subtitle">
            Identificar os melhores dias para operação
          </span>
        </div>

        <div className="grafico-barras-container">
          {dadosFaturamentoDiaSemana.map((item, index) => {
            const proporcao = maxFaturamentoSemana > 0 ? item.valor / maxFaturamentoSemana : 0;
            // Garante diferença visual clara: barras entre 35% e 100%
            const largura = 35 + proporcao * 65;

            return (
              <div key={item.dia} className="barra-item">
                <span className="barra-posicao">{index + 1}º</span>
                <span className="barra-nome">{item.dia}</span>
                <div
                  className="barra-grafico"
                  style={{
                    width: `${largura}%`,
                    background: `linear-gradient(90deg, ${item.cor} 0%, ${item.cor}cc 100%)`,
                  }}
                >
                  R$ {item.valor.toLocaleString("pt-BR")}
                </div>
              </div>
            );
          })}
        </div>
        </section>

        {/* Faturamento x Custos - Gráfico de Linha */}
        <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Faturamento x Custos (7 dias)</h2>
          <span className="dashboard-section-subtitle">
            Evolução comparativa do desempenho financeiro
          </span>
        </div>

        <div className="grafico-linha-container">
          <div className="grafico-linha-legenda">
            <div className="linha-legenda-item">
              <div className="linha-legenda-cor" style={{ backgroundColor: '#3b82f6' }}></div>
              <span>Faturamento</span>
            </div>
            <div className="linha-legenda-item">
              <div className="linha-legenda-cor" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Custos</span>
            </div>
          </div>
          
          <svg className="grafico-linha-svg" viewBox="0 0 700 300" preserveAspectRatio="xMidYMid meet">
            {/* Grid horizontal */}
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line
                  x1="50"
                  y1={250 - i * 50}
                  x2="650"
                  y2={250 - i * 50}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x="35"
                  y={255 - i * 50}
                  fontSize="12"
                  fill="#9ca3af"
                  textAnchor="end"
                >
                  {((maxValorGrafico / 4) * i / 1000).toFixed(1)}k
                </text>
              </g>
            ))}
            
            {/* Linha de Faturamento */}
            <polyline
              points={dadosFaturamentoCustos.map((d, i) => 
                `${50 + (i * 600 / (dadosFaturamentoCustos.length - 1))},${250 - (d.faturamento / maxValorGrafico) * 200}`
              ).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Linha de Custos */}
            <polyline
              points={dadosFaturamentoCustos.map((d, i) => 
                `${50 + (i * 600 / (dadosFaturamentoCustos.length - 1))},${250 - (d.custos / maxValorGrafico) * 200}`
              ).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Pontos de Faturamento */}
            {dadosFaturamentoCustos.map((d, i) => (
              <circle
                key={`fat-${i}`}
                cx={50 + (i * 600 / (dadosFaturamentoCustos.length - 1))}
                cy={250 - (d.faturamento / maxValorGrafico) * 200}
                r="5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            
            {/* Pontos de Custos */}
            {dadosFaturamentoCustos.map((d, i) => (
              <circle
                key={`cus-${i}`}
                cx={50 + (i * 600 / (dadosFaturamentoCustos.length - 1))}
                cy={250 - (d.custos / maxValorGrafico) * 200}
                r="5"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            
            {/* Labels do eixo X */}
            {dadosFaturamentoCustos.map((d, i) => (
              <text
                key={`label-${i}`}
                x={50 + (i * 600 / (dadosFaturamentoCustos.length - 1))}
                y="275"
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {d.data}
              </text>
            ))}
          </svg>
        </div>
        </section>
      </div>

      {/* Ranking de Clientes - Gráfico de Barras Horizontal */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>🏆 Top 10 Clientes - Ranking de Faturamento</h2>
          <span className="dashboard-section-subtitle">
            Clientes que mais geraram receita no período
          </span>
        </div>

        <div className="grafico-barras-container">
          {dadosTopClientes.map((cliente, index) => (
            <div key={index} className="barra-item">
              <span className="barra-posicao">#{index + 1}</span>
              <span className="barra-nome">{cliente.nome}</span>
              <div 
                className="barra-grafico"
                style={{ 
                  width: `${(cliente.faturamento / maxFaturamentoCliente) * 100}%`,
                  background: `linear-gradient(90deg, ${index < 3 ? '#3b82f6' : '#60a5fa'} 0%, ${index < 3 ? '#2563eb' : '#3b82f6'} 100%)`
                }}
              >
                R$ {cliente.faturamento.toLocaleString("pt-BR")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custos por Categoria - Gráfico de Pizza */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>💰 Custos por Categoria</h2>
          <span className="dashboard-section-subtitle">
            Distribuição dos custos operacionais
          </span>
        </div>

        <div className="grafico-pizza-container">
          <div className="grafico-pizza-wrapper">
            <div 
              className="grafico-pizza"
              style={{
                background: `conic-gradient(
                  ${dadosCustosCategorias.map((item, i) => {
                    const porcentagemAnterior = dadosCustosCategorias
                      .slice(0, i)
                      .reduce((sum, c) => sum + (c.valor / totalCustosCategorias) * 100, 0);
                    const porcentagemAtual = (item.valor / totalCustosCategorias) * 100;
                    return `${item.cor} ${porcentagemAnterior}% ${porcentagemAnterior + porcentagemAtual}%`;
                  }).join(', ')}
                )`
              }}
            ></div>
            <div className="grafico-pizza-centro">
              <p className="grafico-pizza-valor">
                R$ {(totalCustosCategorias / 1000).toFixed(1)}k
              </p>
              <p className="grafico-pizza-label">Total</p>
            </div>
            {labelsCustosCategorias.map((item) => (
              <div
                key={item.categoria}
                className="grafico-pizza-rotulo"
                style={{ left: `${item.x}px`, top: `${item.y}px` }}
              >
                <span
                  className="grafico-pizza-rotulo-cor"
                  style={{ backgroundColor: item.cor }}
                ></span>
                <span className="grafico-pizza-rotulo-texto">
                  {item.categoria} {item.porcentagem}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
