import { useState, useEffect } from "react";

const BATERIAS_STORAGE_KEY = "kartodromo_baterias";
const AGENDAMENTOS_STORAGE_KEY = "kartodromo_agendamentos";

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

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function Caixa() {
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoSalvo[]>([]);
  const [dataFiltro, setDataFiltro] = useState("");
  const [caixaFechado, setCaixaFechado] = useState(false);

  useEffect(() => {
    carregarDados();
    // Define data de hoje como padrão
    const hoje = new Date();
    const dataHoje = formatarDataISO(hoje);
    setDataFiltro(dataHoje);
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

  // Filtra baterias por data
  const bateriasDoDia = dataFiltro
    ? baterias.filter(b => b.data === dataFiltro)
    : [];

  // Filtra agendamentos por data
  const agendamentosDoDia = dataFiltro
    ? agendamentos.filter(a => a.data === dataFiltro && a.checkIn)
    : [];

  // Calcula totais
  const totalEsperado = agendamentosDoDia.reduce((acc, ag) => {
    const bateria = baterias.find(b => b.id === ag.bateriaId);
    return acc + (bateria?.valorPorPiloto || 0);
  }, 0);

  const totalRecebido = agendamentosDoDia
    .filter(ag => ag.pagamento)
    .reduce((acc, ag) => {
      const bateria = baterias.find(b => b.id === ag.bateriaId);
      return acc + (bateria?.valorPorPiloto || 0);
    }, 0);

  const totalPendente = totalEsperado - totalRecebido;

  // Totais por método de pagamento
  const porMetodo = {
    dinheiro: 0,
    pix: 0,
    debito: 0,
    credito: 0,
  };

  agendamentosDoDia
    .filter(ag => ag.pagamento && ag.metodoPagamento)
    .forEach(ag => {
      const bateria = baterias.find(b => b.id === ag.bateriaId);
      const valor = bateria?.valorPorPiloto || 0;
      if (ag.metodoPagamento) {
        porMetodo[ag.metodoPagamento] += valor;
      }
    });

  function registrarPagamento(cpf: string, metodo: "dinheiro" | "pix" | "debito" | "credito") {
    const novosAgendamentos = agendamentos.map(ag => {
      if (ag.cpf === cpf && ag.data === dataFiltro) {
        return {
          ...ag,
          pagamento: true,
          metodoPagamento: metodo,
        };
      }
      return ag;
    });

    setAgendamentos(novosAgendamentos);
    localStorage.setItem(AGENDAMENTOS_STORAGE_KEY, JSON.stringify(novosAgendamentos));
  }

  function cancelarPagamento(cpf: string) {
    const novosAgendamentos = agendamentos.map(ag => {
      if (ag.cpf === cpf && ag.data === dataFiltro) {
        return {
          ...ag,
          pagamento: false,
          metodoPagamento: undefined,
        };
      }
      return ag;
    });

    setAgendamentos(novosAgendamentos);
    localStorage.setItem(AGENDAMENTOS_STORAGE_KEY, JSON.stringify(novosAgendamentos));
  }

  function fecharCaixa() {
    if (totalPendente > 0) {
      const confirmar = confirm(
        `Ainda há ${currencyFormatter.format(totalPendente)} pendente. Deseja fechar o caixa mesmo assim?`
      );
      if (!confirmar) return;
    }

    setCaixaFechado(true);
    alert(`Caixa fechado!\n\nTotal recebido: ${currencyFormatter.format(totalRecebido)}\n${totalPendente > 0 ? `Pendente: ${currencyFormatter.format(totalPendente)}` : ''}`);
  }

  function reabrirCaixa() {
    setCaixaFechado(false);
  }

  // Agrupa agendamentos por bateria
  const bateriaComPilotos = bateriasDoDia.map(bateria => {
    const pilotos = agendamentosDoDia.filter(ag => ag.bateriaId === bateria.id);
    const totalBateria = pilotos.length * bateria.valorPorPiloto;
    const recebidoBateria = pilotos.filter(p => p.pagamento).length * bateria.valorPorPiloto;
    
    return {
      bateria,
      pilotos,
      totalBateria,
      recebidoBateria,
      pendenteBateria: totalBateria - recebidoBateria,
    };
  });

  const pilotosSemBateria = agendamentosDoDia.filter(ag => 
    !bateriasDoDia.some(b => b.id === ag.bateriaId)
  );

  return (
    <div className="caixa-page">
      <header className="caixa-header">
        <div>
          <h1>💰 Gestão de Caixa</h1>
          <p className="caixa-subtitle">Controle financeiro de pagamentos</p>
        </div>
        {caixaFechado && (
          <div className="badge-caixa-fechado">
            🔒 Caixa Fechado
          </div>
        )}
      </header>

      {/* Filtro de Data */}
      <div className="caixa-filtro">
        <div className="campo-form" style={{ maxWidth: '300px' }}>
          <label htmlFor="dataFiltro">Data do Caixa</label>
          <input
            id="dataFiltro"
            type="date"
            value={dataFiltro}
            onChange={(e) => {
              setDataFiltro(e.target.value);
              setCaixaFechado(false);
            }}
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              width: '100%'
            }}
          />
        </div>
      </div>

      {!dataFiltro ? (
        <div className="caixa-vazio">
          <p>Selecione uma data para visualizar o caixa</p>
        </div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="caixa-resumo">
            <div className="resumo-card">
              <div className="resumo-icone">📊</div>
              <div className="resumo-info">
                <span className="resumo-label">Total Esperado</span>
                <span className="resumo-valor">{currencyFormatter.format(totalEsperado)}</span>
                <span className="resumo-detalhes">{agendamentosDoDia.length} pilotos confirmados</span>
              </div>
            </div>

            <div className="resumo-card resumo-sucesso">
              <div className="resumo-icone">✓</div>
              <div className="resumo-info">
                <span className="resumo-label">Total Recebido</span>
                <span className="resumo-valor">{currencyFormatter.format(totalRecebido)}</span>
                <span className="resumo-detalhes">
                  {agendamentosDoDia.filter(a => a.pagamento).length} pagamentos
                </span>
              </div>
            </div>

            <div className={`resumo-card ${totalPendente > 0 ? 'resumo-pendente' : 'resumo-completo'}`}>
              <div className="resumo-icone">{totalPendente > 0 ? '⏳' : '🎉'}</div>
              <div className="resumo-info">
                <span className="resumo-label">Pendente</span>
                <span className="resumo-valor">{currencyFormatter.format(totalPendente)}</span>
                <span className="resumo-detalhes">
                  {agendamentosDoDia.filter(a => !a.pagamento).length} pendentes
                </span>
              </div>
            </div>
          </div>

          {/* Resumo por Método */}
          <div className="metodos-resumo">
            <h3>Recebimentos por Método</h3>
            <div className="metodos-grid">
              <div className="metodo-card">
                <span className="metodo-icone">💵</span>
                <span className="metodo-nome">Dinheiro</span>
                <span className="metodo-valor">{currencyFormatter.format(porMetodo.dinheiro)}</span>
              </div>
              <div className="metodo-card">
                <span className="metodo-icone">📱</span>
                <span className="metodo-nome">PIX</span>
                <span className="metodo-valor">{currencyFormatter.format(porMetodo.pix)}</span>
              </div>
              <div className="metodo-card">
                <span className="metodo-icone">💳</span>
                <span className="metodo-nome">Débito</span>
                <span className="metodo-valor">{currencyFormatter.format(porMetodo.debito)}</span>
              </div>
              <div className="metodo-card">
                <span className="metodo-icone">💳</span>
                <span className="metodo-nome">Crédito</span>
                <span className="metodo-valor">{currencyFormatter.format(porMetodo.credito)}</span>
              </div>
            </div>
          </div>

          {/* Lista de Baterias e Pilotos */}
          <div className="caixa-baterias">
            <h3>Baterias do Dia</h3>
            
            {bateriaComPilotos.length === 0 && pilotosSemBateria.length === 0 ? (
              <p className="caixa-vazio-texto">Nenhuma bateria com pilotos confirmados nesta data</p>
            ) : (
              <>
                {bateriaComPilotos.map(({ bateria, pilotos, totalBateria, recebidoBateria, pendenteBateria }) => (
                  <div key={bateria.id} className="bateria-caixa-card">
                    <div className="bateria-caixa-header">
                      <div>
                        <h4>Bateria #{bateria.id} - {bateria.horario}</h4>
                        <p>{pilotos.length} piloto{pilotos.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="bateria-caixa-valores">
                        <div className="valor-info">
                          <span className="valor-label">Esperado:</span>
                          <span className="valor-numero">{currencyFormatter.format(totalBateria)}</span>
                        </div>
                        <div className="valor-info sucesso">
                          <span className="valor-label">Recebido:</span>
                          <span className="valor-numero">{currencyFormatter.format(recebidoBateria)}</span>
                        </div>
                        {pendenteBateria > 0 && (
                          <div className="valor-info pendente">
                            <span className="valor-label">Pendente:</span>
                            <span className="valor-numero">{currencyFormatter.format(pendenteBateria)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pilotos-pagamento-lista">
                      {pilotos.map(piloto => {
                        const valorPiloto = bateria.valorPorPiloto;
                        
                        return (
                          <div key={piloto.cpf} className={`piloto-pagamento-item ${piloto.pagamento ? 'pago' : 'pendente'}`}>
                            <div className="piloto-info">
                              <div className="piloto-nome">{piloto.nome}</div>
                              <div className="piloto-detalhes">
                                CPF: {piloto.cpf} • Tel: {piloto.telefone}
                              </div>
                            </div>

                            <div className="piloto-pagamento-info">
                              <div className="piloto-valor">
                                {currencyFormatter.format(valorPiloto)}
                              </div>
                              
                              {piloto.pagamento ? (
                                <div className="pagamento-confirmado">
                                  <span className="badge-pago">
                                    ✓ Pago via {piloto.metodoPagamento || 'N/A'}
                                  </span>
                                  {!caixaFechado && (
                                    <button
                                      className="btn-cancelar-pagamento"
                                      onClick={() => cancelarPagamento(piloto.cpf)}
                                      title="Cancelar pagamento"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="botoes-pagamento">
                                  {!caixaFechado && (
                                    <>
                                      <button
                                        className="btn-metodo-pagamento dinheiro"
                                        onClick={() => registrarPagamento(piloto.cpf, 'dinheiro')}
                                        title="Pagar em Dinheiro"
                                      >
                                        💵
                                      </button>
                                      <button
                                        className="btn-metodo-pagamento pix"
                                        onClick={() => registrarPagamento(piloto.cpf, 'pix')}
                                        title="Pagar via PIX"
                                      >
                                        📱
                                      </button>
                                      <button
                                        className="btn-metodo-pagamento debito"
                                        onClick={() => registrarPagamento(piloto.cpf, 'debito')}
                                        title="Pagar com Débito"
                                      >
                                        💳
                                      </button>
                                      <button
                                        className="btn-metodo-pagamento credito"
                                        onClick={() => registrarPagamento(piloto.cpf, 'credito')}
                                        title="Pagar com Crédito"
                                      >
                                        💳
                                      </button>
                                    </>
                                  )}
                                  <span className="badge-pendente-pagamento">Pendente</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {pilotosSemBateria.length > 0 && (
                  <div className="bateria-caixa-card">
                    <div className="bateria-caixa-header">
                      <div>
                        <h4>Pilotos sem Bateria Cadastrada</h4>
                        <p>{pilotosSemBateria.length} piloto{pilotosSemBateria.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <p className="aviso-sem-bateria">
                      Estes pilotos têm check-in confirmado mas suas baterias não foram encontradas.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Botão Fechar Caixa */}
          {agendamentosDoDia.length > 0 && (
            <div className="caixa-acoes">
              {!caixaFechado ? (
                <button
                  className="btn-fechar-caixa"
                  onClick={fecharCaixa}
                >
                  🔒 Fechar Caixa
                </button>
              ) : (
                <button
                  className="btn-reabrir-caixa"
                  onClick={reabrirCaixa}
                >
                  🔓 Reabrir Caixa
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
