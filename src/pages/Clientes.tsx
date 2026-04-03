import { useState, useEffect } from "react";

const AGENDAMENTOS_STORAGE_KEY = "kartodromo_agendamentos";
const BATERIAS_STORAGE_KEY = "kartodromo_baterias";

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

type Bateria = {
  id: number;
  data: string;
  horario: string;
  duracaoMinutos: number;
  kartsDisponiveis: number;
  valorPorPiloto: number;
  valorTotal: number;
};

type Cliente = {
  cpf: string;
  nome: string;
  telefone: string;
  totalAgendamentos: number;
  ultimoAgendamento: string;
  totalGasto: number;
  agendamentos: AgendamentoSalvo[];
};

export function Clientes() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoSalvo[]>([]);
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  function carregarDados() {
    try {
      const agendamentosArmazenados = localStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
      const bateriasArmazenadas = localStorage.getItem(BATERIAS_STORAGE_KEY);

      if (agendamentosArmazenados) {
        const listaAgendamentos: AgendamentoSalvo[] = JSON.parse(agendamentosArmazenados);
        setAgendamentos(listaAgendamentos);

        if (bateriasArmazenadas) {
          const listaBaterias: Bateria[] = JSON.parse(bateriasArmazenadas);
          setBaterias(listaBaterias);
          processarClientes(listaAgendamentos, listaBaterias);
        } else {
          processarClientes(listaAgendamentos, []);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  function processarClientes(listaAgendamentos: AgendamentoSalvo[], listaBaterias: Bateria[]) {
    const clientesMap = new Map<string, Cliente>();

    listaAgendamentos.forEach((agendamento) => {
      const cpf = agendamento.cpf;
      
      if (!clientesMap.has(cpf)) {
        clientesMap.set(cpf, {
          cpf: agendamento.cpf,
          nome: agendamento.nome,
          telefone: agendamento.telefone,
          totalAgendamentos: 0,
          ultimoAgendamento: agendamento.data,
          totalGasto: 0,
          agendamentos: [],
        });
      }

      const cliente = clientesMap.get(cpf)!;
      cliente.agendamentos.push(agendamento);
      cliente.totalAgendamentos = cliente.agendamentos.length;

      // Atualizar último agendamento
      if (agendamento.data > cliente.ultimoAgendamento) {
        cliente.ultimoAgendamento = agendamento.data;
      }

      // Calcular total gasto (apenas agendamentos pagos)
      if (agendamento.pagamento) {
        const bateria = listaBaterias.find(b => b.id === agendamento.bateriaId);
        if (bateria) {
          cliente.totalGasto += bateria.valorPorPiloto;
        }
      }
    });

    const listaClientes = Array.from(clientesMap.values()).sort((a, b) => 
      b.ultimoAgendamento.localeCompare(a.ultimoAgendamento)
    );

    setClientes(listaClientes);
  }

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.cpf.includes(busca) ||
    cliente.telefone.includes(busca)
  );

  function abrirDetalhesCliente(cliente: Cliente) {
    setClienteSelecionado(cliente);
  }

  function fecharDetalhesCliente() {
    setClienteSelecionado(null);
  }

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="clientes-page">
      <header className="clientes-header">
        <div>
          <h1>👥 Base de Clientes</h1>
          <p className="clientes-subtitle">Gerencie todos os seus clientes cadastrados</p>
        </div>
        <div className="clientes-stats">
          <div className="stat-item">
            <span className="stat-numero">{clientes.length}</span>
            <span className="stat-label">Clientes</span>
          </div>
          <div className="stat-item">
            <span className="stat-numero">{agendamentos.length}</span>
            <span className="stat-label">Agendamentos</span>
          </div>
        </div>
      </header>

      {/* Busca */}
      <div className="clientes-busca">
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      {/* Lista de Clientes */}
      {clientesFiltrados.length === 0 ? (
        <div className="clientes-vazio">
          <p>{busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}</p>
        </div>
      ) : (
        <div className="clientes-grid">
          {clientesFiltrados.map((cliente) => (
            <div
              key={cliente.cpf}
              className="cliente-card"
              onClick={() => abrirDetalhesCliente(cliente)}
            >
              <div className="cliente-card-header">
                <div className="cliente-avatar">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <div className="cliente-info-basica">
                  <h3>{cliente.nome}</h3>
                  <p>CPF: {cliente.cpf}</p>
                  <p>Tel: {cliente.telefone}</p>
                </div>
              </div>
              <div className="cliente-card-stats">
                <div className="cliente-stat">
                  <span className="stat-valor">{cliente.totalAgendamentos}</span>
                  <span className="stat-desc">Agendamentos</span>
                </div>
                <div className="cliente-stat">
                  <span className="stat-valor">{currencyFormatter.format(cliente.totalGasto)}</span>
                  <span className="stat-desc">Total Gasto</span>
                </div>
              </div>
              <div className="cliente-card-footer">
                Último agendamento: {new Date(cliente.ultimoAgendamento + 'T00:00').toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes do Cliente */}
      {clienteSelecionado && (
        <div className="modal-overlay" onClick={fecharDetalhesCliente}>
          <div className="modal-content modal-cliente" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="cliente-modal-header">
                <div className="cliente-avatar-grande">
                  {clienteSelecionado.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{clienteSelecionado.nome}</h2>
                  <p className="cliente-dados">CPF: {clienteSelecionado.cpf} • Tel: {clienteSelecionado.telefone}</p>
                </div>
              </div>
              <button className="modal-fechar" onClick={fecharDetalhesCliente}>✕</button>
            </div>

            <div className="modal-body">
              {/* Resumo do Cliente */}
              <div className="cliente-resumo">
                <div className="resumo-item">
                  <span className="resumo-icon">📅</span>
                  <div>
                    <span className="resumo-numero">{clienteSelecionado.totalAgendamentos}</span>
                    <span className="resumo-texto">Agendamentos</span>
                  </div>
                </div>
                <div className="resumo-item">
                  <span className="resumo-icon">💰</span>
                  <div>
                    <span className="resumo-numero">{currencyFormatter.format(clienteSelecionado.totalGasto)}</span>
                    <span className="resumo-texto">Total Gasto</span>
                  </div>
                </div>
                <div className="resumo-item">
                  <span className="resumo-icon">✓</span>
                  <div>
                    <span className="resumo-numero">
                      {clienteSelecionado.agendamentos.filter(a => a.checkIn).length}
                    </span>
                    <span className="resumo-texto">Check-ins</span>
                  </div>
                </div>
                <div className="resumo-item">
                  <span className="resumo-icon">💳</span>
                  <div>
                    <span className="resumo-numero">
                      {clienteSelecionado.agendamentos.filter(a => a.pagamento).length}
                    </span>
                    <span className="resumo-texto">Pagamentos</span>
                  </div>
                </div>
              </div>

              {/* Histórico de Agendamentos */}
              <div className="cliente-historico">
                <h3>Histórico de Agendamentos</h3>
                {clienteSelecionado.agendamentos.length === 0 ? (
                  <p className="historico-vazio">Nenhum agendamento encontrado</p>
                ) : (
                  <div className="historico-lista">
                    {clienteSelecionado.agendamentos
                      .sort((a, b) => b.data.localeCompare(a.data))
                      .map((agendamento, index) => {
                        const bateria = baterias.find(b => b.id === agendamento.bateriaId);
                        
                        return (
                          <div key={index} className="historico-item">
                            <div className="historico-data">
                              <span className="data-dia">
                                {new Date(agendamento.data + 'T00:00').getDate()}
                              </span>
                              <span className="data-mes">
                                {new Date(agendamento.data + 'T00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                              </span>
                            </div>
                            <div className="historico-info">
                              <div className="historico-principal">
                                <span className="historico-bateria">{agendamento.bateria}</span>
                                <span className="historico-horario">{agendamento.horario}</span>
                              </div>
                              <div className="historico-detalhes">
                                {bateria && (
                                  <span className="historico-valor">
                                    {currencyFormatter.format(bateria.valorPorPiloto)}
                                  </span>
                                )}
                                <span className={`badge badge-${agendamento.checkIn ? 'confirmado' : 'reservado'}`}>
                                  {agendamento.checkIn ? 'Confirmado' : 'Reservado'}
                                </span>
                                {agendamento.pagamento && (
                                  <span className="badge badge-pago-historico">
                                    ✓ Pago {agendamento.metodoPagamento ? `via ${agendamento.metodoPagamento}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
