import { useState, useEffect } from "react";

const AGENDAMENTOS_STORAGE_KEY = "kartodromo_agendamentos";
const BATERIAS_STORAGE_KEY = "kartodromo_baterias";

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

export function Agendamentos() {
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoSalvo[]>([]);
  const [dataFiltro, setDataFiltro] = useState("");
  const [bateriaSelecionada, setBateriaSelecionada] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Carrega baterias e agendamentos do localStorage
  useEffect(() => {
    try {
      const bateriasArmazenadas = localStorage.getItem(BATERIAS_STORAGE_KEY);
      if (bateriasArmazenadas) {
        setBaterias(JSON.parse(bateriasArmazenadas));
      }

      const agendamentosArmazenados = localStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
      if (agendamentosArmazenados) {
        setAgendamentos(JSON.parse(agendamentosArmazenados));
      }
    } catch {
      // Em caso de erro, mantém arrays vazios
    }
  }, []);

  // Filtra baterias por data
  const bateriasFiltradas = dataFiltro
    ? baterias.filter((b) => b.data === dataFiltro)
    : [];

  // Calcula vagas restantes para cada bateria
  function getVagasRestantes(bateriaId: number): number {
    const bateria = baterias.find((b) => b.id === bateriaId);
    if (!bateria) return 0;

    const agendamentosDaBateria = agendamentos.filter(
      (a) => a.bateriaId === bateriaId
    );

    return bateria.kartsDisponiveis - agendamentosDaBateria.length;
  }

  const bateriaAtual = bateriaSelecionada
    ? baterias.find((b) => b.id === bateriaSelecionada)
    : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!bateriaSelecionada) {
      alert("Escolha uma bateria para continuar.");
      return;
    }

    if (!nome || !cpf || !telefone) {
      alert("Preencha todos os dados do piloto.");
      return;
    }

    if (!bateriaAtual) {
      alert("Houve um problema ao localizar a bateria selecionada.");
      return;
    }

    const vagasRestantes = getVagasRestantes(bateriaSelecionada);
    if (vagasRestantes <= 0) {
      alert("Esta bateria não tem mais vagas disponíveis.");
      return;
    }

    const novoAgendamento: AgendamentoSalvo = {
      cpf: cpf.trim(),
      nome: nome.trim(),
      telefone: telefone.trim(),
      bateriaId: bateriaAtual.id,
      bateria: `Bateria ${bateriaAtual.id}`,
      horario: bateriaAtual.horario,
      data: bateriaAtual.data,
      status: "pendente",
      checkIn: false,
      pagamento: false,
    };

    try {
      const existente = localStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
      const lista: AgendamentoSalvo[] = existente
        ? JSON.parse(existente)
        : [];

      const listaAtualizada = [...lista, novoAgendamento];
      localStorage.setItem(
        AGENDAMENTOS_STORAGE_KEY,
        JSON.stringify(listaAtualizada)
      );
      setAgendamentos(listaAtualizada);
    } catch {
      // se der erro no localStorage, apenas segue com a confirmação visual
    }

    setMensagemSucesso(
      `Reserva recebida para ${nome} na Bateria ${bateriaAtual.id} às ${bateriaAtual.horario}.`
    );

    // Limpa seleção e formulário
    setBateriaSelecionada(null);
    setNome("");
    setCpf("");
    setTelefone("");

    // Remove mensagem após 5 segundos
    setTimeout(() => setMensagemSucesso(null), 5000);
  }

  return (
    <div className="agendamentos">
      <header className="agendamentos-header">
        <div>
          <h1>Agende sua bateria</h1>
          <p className="agendamentos-subtitle">
            Escolha uma data e horário para garantir sua vaga.
          </p>
        </div>
      </header>

      <div className="agendamentos-layout">
        <section className="agendamentos-baterias">
          <h2>Escolha a bateria</h2>
          
          <div className="campo-form" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="dataFiltro">Selecione a data</label>
            <input
              id="dataFiltro"
              type="date"
              value={dataFiltro}
              onChange={(e) => {
                setDataFiltro(e.target.value);
                setBateriaSelecionada(null);
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

          {!dataFiltro && (
            <p className="agendamentos-texto-ajuda">
              Selecione uma data acima para ver as baterias disponíveis.
            </p>
          )}

          {dataFiltro && bateriasFiltradas.length === 0 && (
            <p className="agendamentos-texto-ajuda" style={{ color: '#e74c3c' }}>
              Nenhuma bateria disponível para esta data.
            </p>
          )}

          {dataFiltro && bateriasFiltradas.length > 0 && (
            <>
              <p className="agendamentos-texto-ajuda">
                {bateriasFiltradas.length} bateria{bateriasFiltradas.length > 1 ? 's' : ''} disponível{bateriasFiltradas.length > 1 ? 'is' : ''} em {new Date(dataFiltro + 'T00:00').toLocaleDateString('pt-BR')}
              </p>

              <div className="agendamentos-baterias-lista">
                {bateriasFiltradas.map((bateria) => {
                  const vagasRestantes = getVagasRestantes(bateria.id);
                  const semVagas = vagasRestantes <= 0;

                  return (
                    <button
                      key={bateria.id}
                      type="button"
                      className={
                        "bateria-card " +
                        (bateriaSelecionada === bateria.id ? "bateria-card-ativa" : "") +
                        (semVagas ? " bateria-card-esgotada" : "")
                      }
                      onClick={() => !semVagas && setBateriaSelecionada(bateria.id)}
                      disabled={semVagas}
                    >
                      <div className="bateria-card-horario">{bateria.horario}</div>
                      <div className="bateria-card-nome">Bateria {bateria.id}</div>
                      <div className="bateria-card-vagas">
                        {semVagas ? (
                          <span style={{ color: '#e74c3c' }}>Sem vagas</span>
                        ) : (
                          <>
                            {vagasRestantes} vaga{vagasRestantes > 1 ? 's' : ''} restante{vagasRestantes > 1 ? 's' : ''}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="agendamentos-form-wrapper">
          <h2>Dados do piloto</h2>
          <p className="agendamentos-texto-ajuda">
            Informe seus dados exatamente como constam no documento.
          </p>

          <form className="agendamentos-form" onSubmit={handleSubmit}>
            <div className="campo-form">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
              />
            </div>

            <div className="campo-form">
              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="campo-form">
              <label htmlFor="telefone">Telefone / WhatsApp</label>
              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <button type="submit" className="botao-primario">
              Confirmar agendamento
            </button>

            {mensagemSucesso && (
              <p className="mensagem-sucesso">{mensagemSucesso}</p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
