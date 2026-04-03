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

type Lembrete = {
  id: string;
  titulo: string;
  tipo: "manutencao" | "estoque" | "evento" | "administrativo";
  diasRestantes: number;
  prioridade: "alta" | "media" | "baixa";
};

type Compromisso = {
  id: string;
  nome: string;
  data: string;
  horario: string;
  duracao: number;
  repete: boolean;
  frequencia?: "diaria" | "semanal" | "mensal";
  cor: string;
  notas?: string;
};

const BATERIAS_STORAGE_KEY = "kartodromo_baterias";
const AGENDAMENTOS_STORAGE_KEY = "kartodromo_agendamentos";
const LEMBRETES_STORAGE_KEY = "kartodromo_lembretes";
const COMPROMISSOS_STORAGE_KEY = "kartodromo_compromissos";

const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const diasDaSemanaCompleto = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const diasDaSemanaAbrev = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const lembretesIniciais: Lembrete[] = [
  {
    id: "1",
    titulo: "Manutenção preventiva dos karts",
    tipo: "manutencao",
    diasRestantes: 3,
    prioridade: "alta"
  },
  {
    id: "2",
    titulo: "Reposição de combustível",
    tipo: "estoque",
    diasRestantes: 7,
    prioridade: "media"
  },
  {
    id: "3",
    titulo: "Evento corporativo agendado",
    tipo: "evento",
    diasRestantes: 15,
    prioridade: "alta"
  },
  {
    id: "4",
    titulo: "Renovação de seguro",
    tipo: "administrativo",
    diasRestantes: 30,
    prioridade: "media"
  }
];

export function Calendario() {
  const [visualizacao, setVisualizacao] = useState<"semanal" | "mensal">("semanal");
  const [dataAtual, setDataAtual] = useState(new Date());
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoSalvo[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [bateriaDetalhes, setBateriaDetalhes] = useState<Bateria | null>(null);
  const [mostrarModalNovoCompromisso, setMostrarModalNovoCompromisso] = useState(false);
  const [diaDetalhes, setDiaDetalhes] = useState<Date | null>(null);
  const [mostrarModalProgramados, setMostrarModalProgramados] = useState(false);
  const [compromissoDetalhes, setCompromissoDetalhes] = useState<Compromisso | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [eventosHorario, setEventosHorario] = useState<{bateria?: Bateria, compromissos: Compromisso[]} | null>(null);
  
  // Form state para novo compromisso
  const [nomeCompromisso, setNomeCompromisso] = useState("");
  const [dataCompromisso, setDataCompromisso] = useState("");
  const [horarioCompromisso, setHorarioCompromisso] = useState("");
  const [duracaoCompromisso, setDuracaoCompromisso] = useState(60);
  const [repeteCompromisso, setRepeteCompromisso] = useState(false);
  const [frequenciaCompromisso, setFrequenciaCompromisso] = useState<"diaria" | "semanal" | "mensal">("semanal");
  const [corCompromisso, setCorCompromisso] = useState("#3b82f6");
  const [notasCompromisso, setNotasCompromisso] = useState("");

  useEffect(() => {
    carregarDados();
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

      const lembretesArmazenados = localStorage.getItem(LEMBRETES_STORAGE_KEY);
      if (lembretesArmazenados) {
        setLembretes(JSON.parse(lembretesArmazenados));
      } else {
        setLembretes(lembretesIniciais);
        localStorage.setItem(LEMBRETES_STORAGE_KEY, JSON.stringify(lembretesIniciais));
      }

      const compromissosArmazenados = localStorage.getItem(COMPROMISSOS_STORAGE_KEY);
      if (compromissosArmazenados) {
        const compromissosParsed = JSON.parse(compromissosArmazenados);
        // Normalizar horários para formato HH:MM
        const compromissosNormalizados = compromissosParsed.map((c: Compromisso) => ({
          ...c,
          horario: c.horario.substring(0, 5)
        }));
        setCompromissos(compromissosNormalizados);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLembretes(lembretesIniciais);
    }
  }

  function irParaHoje() {
    setDataAtual(new Date());
  }

  function anteriorPeriodo() {
    if (visualizacao === "semanal") {
      const novaData = new Date(dataAtual);
      novaData.setDate(novaData.getDate() - 7);
      setDataAtual(novaData);
    } else {
      setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1));
    }
  }

  function proximoPeriodo() {
    if (visualizacao === "semanal") {
      const novaData = new Date(dataAtual);
      novaData.setDate(novaData.getDate() + 7);
      setDataAtual(novaData);
    } else {
      setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1));
    }
  }

  function getDiasDaSemana() {
    const inicio = new Date(dataAtual);
    inicio.setDate(inicio.getDate() - inicio.getDay());
    
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      dias.push(dia);
    }
    return dias;
  }

  function getDiasDoMes() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    const dias = [];
    
    // Apenas dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(ano, mes, dia);
      dias.push({ data, mesAtual: true });
    }
    
    return dias;
  }

  function getHorariosDinamicos(): string[] {
    const diasSemana = getDiasDaSemana();
    const todosHorarios: number[] = [];
    
    // Coletar todos os horários das baterias e compromissos da semana
    diasSemana.forEach(dia => {
      const bateriasDay = getBateriasDoDia(dia);
      const compromissosDay = getCompromissosDoDia(dia);
      
      // Extrair hora como número
      bateriasDay.forEach(b => {
        const [hora] = b.horario.split(':').map(Number);
        if (!isNaN(hora)) todosHorarios.push(hora);
      });
      compromissosDay.forEach(c => {
        const [hora] = c.horario.split(':').map(Number);
        if (!isNaN(hora)) todosHorarios.push(hora);
      });
    });
    
    // Se não houver eventos, retornar horário padrão
    if (todosHorarios.length === 0) {
      return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
    }
    
    const menorHora = Math.min(...todosHorarios);
    const maiorHora = Math.max(...todosHorarios);
    
    // Adicionar margem de 1 hora antes e 2 horas depois
    const inicio = Math.max(7, menorHora - 1); // Não começar antes das 7h
    const fim = Math.min(23, maiorHora + 2); // Não passar das 23h
    
    // Gerar array de horários
    const horariosGerados: string[] = [];
    for (let h = inicio; h <= fim; h++) {
      horariosGerados.push(`${String(h).padStart(2, '0')}:00`);
    }
    
    return horariosGerados;
  }

  function getBateriasDoDia(data: Date): Bateria[] {
    const dataStr = formatarDataISO(data);
    return baterias.filter(b => b.data === dataStr);
  }

  function getPilotosDaBateria(bateria: Bateria): AgendamentoSalvo[] {
    return agendamentos.filter(
      ag => ag.bateriaId === bateria.id
    );
  }

  function getVagasRestantes(bateria: Bateria): number {
    const pilotos = getPilotosDaBateria(bateria);
    return bateria.kartsDisponiveis - pilotos.length;
  }

  function getFaturamentoBateria(bateria: Bateria): number {
    const pilotos = getPilotosDaBateria(bateria);
    return pilotos.length * bateria.valorPorPiloto;
  }

  function formatarDataISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  function abrirDetalhes(bateria: Bateria) {
    setBateriaDetalhes(bateria);
  }

  function fecharDetalhes() {
    setBateriaDetalhes(null);
  }

  function alternarCheckIn(cpf: string) {
    const novosAgendamentos = agendamentos.map(ag => {
      if (ag.cpf === cpf) {
        const novoCheckIn = !ag.checkIn;
        return { 
          ...ag, 
          checkIn: novoCheckIn,
          status: (novoCheckIn ? "confirmado" : "pendente") as "confirmado" | "pendente"
        };
      }
      return ag;
    });
    setAgendamentos(novosAgendamentos);
    localStorage.setItem(AGENDAMENTOS_STORAGE_KEY, JSON.stringify(novosAgendamentos));
  }

  function alternarPagamento(cpf: string) {
    const novosAgendamentos = agendamentos.map(ag => {
      if (ag.cpf === cpf) {
        return { ...ag, pagamento: !ag.pagamento };
      }
      return ag;
    });
    setAgendamentos(novosAgendamentos);
    localStorage.setItem(AGENDAMENTOS_STORAGE_KEY, JSON.stringify(novosAgendamentos));
  }

  function removerLembrete(id: string) {
    const novosLembretes = lembretes.filter(l => l.id !== id);
    setLembretes(novosLembretes);
    localStorage.setItem(LEMBRETES_STORAGE_KEY, JSON.stringify(novosLembretes));
  }

  function abrirModalNovoCompromisso() {
    // Preencher com data e hora padrão
    const hoje = new Date();
    setDataCompromisso(formatarDataISO(hoje));
    setHorarioCompromisso("09:00");
    setMostrarModalNovoCompromisso(true);
  }

  function fecharModalNovoCompromisso() {
    setMostrarModalNovoCompromisso(false);
    limparFormularioCompromisso();
  }

  function limparFormularioCompromisso() {
    setNomeCompromisso("");
    setDataCompromisso("");
    setHorarioCompromisso("");
    setDuracaoCompromisso(60);
    setRepeteCompromisso(false);
    setFrequenciaCompromisso("semanal");
    setCorCompromisso("#3b82f6");
    setNotasCompromisso("");
  }

  function salvarNovoCompromisso(e: React.FormEvent) {
    e.preventDefault();

    if (!nomeCompromisso || !dataCompromisso || !horarioCompromisso) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    // Normalizar horário para formato HH:MM
    const horarioNormalizado = horarioCompromisso.substring(0, 5);

    const compromissosParaSalvar: Compromisso[] = [];
    const dataInicial = new Date(dataCompromisso + "T00:00:00");
    
    // Se repete, criar múltiplas ocorrências
    if (repeteCompromisso && frequenciaCompromisso) {
      let ocorrencias = 52; // 1 ano de repetições
      
      for (let i = 0; i < ocorrencias; i++) {
        let dataAtual: Date;
        
        if (frequenciaCompromisso === "diaria") {
          dataAtual = new Date(dataInicial);
          dataAtual.setDate(dataInicial.getDate() + i);
        } else if (frequenciaCompromisso === "semanal") {
          dataAtual = new Date(dataInicial);
          dataAtual.setDate(dataInicial.getDate() + (i * 7));
        } else if (frequenciaCompromisso === "mensal") {
          dataAtual = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, dataInicial.getDate());
        } else {
          continue;
        }
        
        const compromisso: Compromisso = {
          id: `${Date.now()}-${i}`,
          nome: nomeCompromisso,
          data: formatarDataISO(dataAtual),
          horario: horarioNormalizado,
          duracao: duracaoCompromisso,
          repete: repeteCompromisso,
          frequencia: frequenciaCompromisso,
          cor: corCompromisso,
          notas: notasCompromisso
        };
        
        compromissosParaSalvar.push(compromisso);
      }
    } else {
      // Compromisso único
      const compromisso: Compromisso = {
        id: Date.now().toString(),
        nome: nomeCompromisso,
        data: dataCompromisso,
        horario: horarioNormalizado,
        duracao: duracaoCompromisso,
        repete: false,
        cor: corCompromisso,
        notas: notasCompromisso
      };
      
      compromissosParaSalvar.push(compromisso);
    }

    const novosCompromissos = [...compromissos, ...compromissosParaSalvar];
    setCompromissos(novosCompromissos);
    localStorage.setItem(COMPROMISSOS_STORAGE_KEY, JSON.stringify(novosCompromissos));
    
    fecharModalNovoCompromisso();
  }

  function getCompromissosDoDia(data: Date): Compromisso[] {
    const dataStr = formatarDataISO(data);
    return compromissos.filter(c => c.data === dataStr);
  }

  function getCorLembrete(tipo: string) {
    switch (tipo) {
      case "manutencao": return "#ef4444";
      case "estoque": return "#f59e0b";
      case "evento": return "#3b82f6";
      case "administrativo": return "#8b5cf6";
      default: return "#6b7280";
    }
  }

  function getIconeLembrete(tipo: string) {
    switch (tipo) {
      case "manutencao": return "🔧";
      case "estoque": return "📦";
      case "evento": return "🎯";
      case "administrativo": return "📋";
      default: return "📌";
    }
  }

  function abrirDetalhesDia(data: Date) {
    setDiaDetalhes(data);
  }

  function fecharDetalhesDia() {
    setDiaDetalhes(null);
  }

  function abrirModalProgramados() {
    setMostrarModalProgramados(true);
  }

  function fecharModalProgramados() {
    setMostrarModalProgramados(false);
  }

  function excluirCompromisso(id: string) {
    if (!confirm("Tem certeza que deseja excluir este compromisso?")) {
      return;
    }
    
    const novosCompromissos = compromissos.filter(c => c.id !== id);
    setCompromissos(novosCompromissos);
    localStorage.setItem(COMPROMISSOS_STORAGE_KEY, JSON.stringify(novosCompromissos));
  }

  function excluirSerieCompromisso(nomeBase: string) {
    if (!confirm("Tem certeza que deseja excluir toda a série de compromissos com este nome?")) {
      return;
    }
    
    const novosCompromissos = compromissos.filter(c => c.nome !== nomeBase);
    setCompromissos(novosCompromissos);
    localStorage.setItem(COMPROMISSOS_STORAGE_KEY, JSON.stringify(novosCompromissos));
  }

  function abrirDetalhesCompromisso(compromisso: Compromisso) {
    setCompromissoDetalhes(compromisso);
    setModoEdicao(false);
    // Preencher form com dados do compromisso
    setNomeCompromisso(compromisso.nome);
    setDataCompromisso(compromisso.data);
    setHorarioCompromisso(compromisso.horario);
    setDuracaoCompromisso(compromisso.duracao);
    setRepeteCompromisso(compromisso.repete);
    setFrequenciaCompromisso(compromisso.frequencia || "semanal");
    setCorCompromisso(compromisso.cor);
    setNotasCompromisso(compromisso.notas || "");
  }

  function fecharDetalhesCompromisso() {
    setCompromissoDetalhes(null);
    setModoEdicao(false);
    limparFormularioCompromisso();
  }

  function ativarModoEdicao() {
    setModoEdicao(true);
  }

  function salvarEdicaoCompromisso(e: React.FormEvent) {
    e.preventDefault();

    if (!compromissoDetalhes || !nomeCompromisso || !dataCompromisso || !horarioCompromisso) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    // Normalizar horário para formato HH:MM
    const horarioNormalizado = horarioCompromisso.substring(0, 5);

    const compromissoAtualizado: Compromisso = {
      ...compromissoDetalhes,
      nome: nomeCompromisso,
      data: dataCompromisso,
      horario: horarioNormalizado,
      duracao: duracaoCompromisso,
      repete: repeteCompromisso,
      frequencia: repeteCompromisso ? frequenciaCompromisso : undefined,
      cor: corCompromisso,
      notas: notasCompromisso
    };

    const novosCompromissos = compromissos.map(c => 
      c.id === compromissoDetalhes.id ? compromissoAtualizado : c
    );

    setCompromissos(novosCompromissos);
    localStorage.setItem(COMPROMISSOS_STORAGE_KEY, JSON.stringify(novosCompromissos));
    fecharDetalhesCompromisso();
  }

  function excluirCompromissoAtual() {
    if (!compromissoDetalhes) return;
    excluirCompromisso(compromissoDetalhes.id);
    fecharDetalhesCompromisso();
  }

  function abrirEventosHorario(bateria: Bateria | undefined, compromissos: Compromisso[]) {
    setEventosHorario({ bateria, compromissos });
  }

  function fecharEventosHorario() {
    setEventosHorario(null);
  }

  const diasSemana = getDiasDaSemana();
  const diasMes = getDiasDoMes();
  const pilotosDaBateriaDetalhada = bateriaDetalhes ? getPilotosDaBateria(bateriaDetalhes) : [];
  
  // Agrupar compromissos únicos por nome para listar no modal de programados
  const compromissosUnicos = Array.from(
    new Map(
      compromissos
        .filter(c => c.repete)
        .map(c => [c.nome, c])
    ).values()
  );

  const periodoTexto = visualizacao === "semanal"
    ? `${diasSemana[0].getDate()} de ${meses[diasSemana[0].getMonth()].substring(0, 3)} - ${diasSemana[6].getDate()} de ${meses[diasSemana[6].getMonth()].substring(0, 3)} de ${diasSemana[6].getFullYear()}`
    : `${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;

  return (
    <div className="agenda-page">
      <div className="agenda-sidebar">
        <div className="lembretes-importantes">
          <div className="lembretes-header">
            <span className="lembretes-icone">⚠️</span>
            <h3>Lembretes importantes</h3>
          </div>
          
          <div className="lembretes-lista">
            {lembretes.map(lembrete => (
              <div key={lembrete.id} className="lembrete-item" style={{ borderLeftColor: getCorLembrete(lembrete.tipo) }}>
                <div className="lembrete-conteudo">
                  <span className="lembrete-tipo-icone">{getIconeLembrete(lembrete.tipo)}</span>
                  <div className="lembrete-info">
                    <p className="lembrete-titulo">{lembrete.titulo}</p>
                    <p className="lembrete-prazo" style={{ color: getCorLembrete(lembrete.tipo) }}>
                      {lembrete.diasRestantes} dias
                    </p>
                  </div>
                </div>
                <button 
                  className="lembrete-remover"
                  onClick={() => removerLembrete(lembrete.id)}
                  title="Marcar como concluído"
                >
                  ✓
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-programados">
          <div className="sidebar-programados-header">
            <span className="sidebar-programados-icone">📋</span>
            <h3>Programados</h3>
          </div>
          
          <div className="sidebar-programados-lista">
            {compromissos.length === 0 ? (
              <p className="sem-programados">Nenhum compromisso programado</p>
            ) : (
              <>
                {compromissosUnicos.slice(0, 3).map(comp => (
                  <div 
                    key={comp.id} 
                    className="sidebar-programado-item" 
                    style={{ borderLeftColor: comp.cor }}
                    onClick={abrirModalProgramados}
                  >
                    <div className="sidebar-programado-nome">{comp.nome}</div>
                    <div className="sidebar-programado-info">
                      <span>🔁 {comp.frequencia === "diaria" ? "Diária" : comp.frequencia === "semanal" ? "Semanal" : "Mensal"}</span>
                      <span>{comp.horario}</span>
                    </div>
                  </div>
                ))}
                {compromissos.filter(c => !c.repete).slice(0, 3 - Math.min(compromissosUnicos.length, 3)).map(comp => (
                  <div 
                    key={comp.id} 
                    className="sidebar-programado-item" 
                    style={{ borderLeftColor: comp.cor }}
                    onClick={() => {
                      const dataComp = new Date(comp.data + "T00:00:00");
                      setDataAtual(dataComp);
                      abrirDetalhesDia(dataComp);
                    }}
                  >
                    <div className="sidebar-programado-nome">{comp.nome}</div>
                    <div className="sidebar-programado-info">
                      <span>{new Date(comp.data + "T00:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      <span>{comp.horario}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {compromissos.length > 0 && (
            <button className="btn-ver-todos" onClick={abrirModalProgramados}>
              Ver todos ({compromissos.length})
            </button>
          )}
        </div>
      </div>

      <div className="agenda-conteudo">
        <header className="agenda-header">
          <div className="agenda-titulo-secao">
            <h1>Agenda</h1>
            <p>Gerencie os compromissos da equipe comercial</p>
          </div>
        </header>

        <div className="agenda-controles">
          <div className="agenda-navegacao">
            <button className="btn-hoje" onClick={irParaHoje}>Hoje</button>
            <button className="btn-navegacao" onClick={anteriorPeriodo}>‹</button>
            <button className="btn-navegacao" onClick={proximoPeriodo}>›</button>
            <h2 className="periodo-atual">{periodoTexto}</h2>
          </div>

          <div className="agenda-opcoes">
            <button className="btn-novo-compromisso" onClick={abrirModalNovoCompromisso}>
              + Novo
            </button>
            <div className="visualizacao-toggle">
              <button
                className={`toggle-btn ${visualizacao === "semanal" ? "ativo" : ""}`}
                onClick={() => setVisualizacao("semanal")}
              >
                Semana
              </button>
              <button
                className={`toggle-btn ${visualizacao === "mensal" ? "ativo" : ""}`}
                onClick={() => setVisualizacao("mensal")}
              >
                Mês
              </button>
            </div>
          </div>
        </div>

        {visualizacao === "semanal" ? (
          <div className="agenda-semanal">
            <div className="semana-header">
              <div className="header-vazio"></div>
              {diasSemana.map((dia, index) => {
                const isHoje = dia.toDateString() === new Date().toDateString();
                return (
                  <div 
                    key={index} 
                    className={`dia-header ${isHoje ? "hoje" : ""}`}
                    onClick={() => abrirDetalhesDia(dia)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="dia-nome">{diasDaSemanaAbrev[dia.getDay()]}</div>
                    <div className={`dia-numero ${isHoje ? "destaque" : ""}`}>
                      {dia.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="semana-grid">
              <div className="horarios-coluna">
                {getHorariosDinamicos().map(hora => (
                  <div key={hora} className="horario-label">{hora}</div>
                ))}
              </div>

              {diasSemana.map((dia, diaIndex) => {
                const bateriasDoDia = getBateriasDoDia(dia);
                const compromissosDoDia = getCompromissosDoDia(dia);
                const isHoje = dia.toDateString() === new Date().toDateString();
                return (
                  <div key={diaIndex} className={`dia-coluna ${isHoje ? "coluna-hoje" : ""}`}>
                    {getHorariosDinamicos().map((hora, horaIndex) => {
                      // Extrair a hora do slot (ex: "21:00" -> 21)
                      const horaSlotNumero = parseInt(hora.split(':')[0], 10);
                      
                      // Filtrar eventos que pertencem a este slot de hora
                      const bateriaNaHora = bateriasDoDia.find(b => {
                        const horaBateria = parseInt(b.horario.split(':')[0], 10);
                        return horaBateria === horaSlotNumero;
                      });
                      
                      const compromissosNaHora = compromissosDoDia.filter(c => {
                        const horaCompromisso = parseInt(c.horario.split(':')[0], 10);
                        return horaCompromisso === horaSlotNumero;
                      });
                      
                      const pilotos = bateriaNaHora ? getPilotosDaBateria(bateriaNaHora) : [];
                      const totalEventos = (bateriaNaHora ? 1 : 0) + compromissosNaHora.length;
                      const temMultiplosEventos = totalEventos > 1;
                      
                      // Definir evento principal a mostrar
                      const eventoPrincipal = bateriaNaHora || compromissosNaHora[0];
                      
                      if (!eventoPrincipal) {
                        return <div key={horaIndex} className="horario-slot"></div>;
                      }
                      
                      return (
                        <div key={horaIndex} className="horario-slot">
                          {bateriaNaHora ? (
                            <button
                              className="evento-card"
                              onClick={() => {
                                if (temMultiplosEventos) {
                                  abrirEventosHorario(bateriaNaHora, compromissosNaHora);
                                } else {
                                  abrirDetalhes(bateriaNaHora);
                                }
                              }}
                              style={{ 
                                height: `${bateriaNaHora.duracaoMinutos * 1.5}px`,
                                minHeight: "50px",
                                position: "relative"
                              }}
                            >
                              <div className="evento-horario">{bateriaNaHora.horario}</div>
                              <div className="evento-titulo">Bateria #{bateriaNaHora.id}</div>
                              <div className="evento-detalhes">
                                {pilotos.length}/{bateriaNaHora.kartsDisponiveis} pilotos
                              </div>
                              {temMultiplosEventos && (
                                <div className="eventos-badge">+{compromissosNaHora.length}</div>
                              )}
                            </button>
                          ) : (
                            <button
                              className="evento-card compromisso-card"
                              onClick={() => {
                                if (temMultiplosEventos) {
                                  abrirEventosHorario(undefined, compromissosNaHora);
                                } else {
                                  abrirDetalhesCompromisso(compromissosNaHora[0]);
                                }
                              }}
                              style={{ 
                                height: `${compromissosNaHora[0].duracao * 1}px`,
                                minHeight: "50px",
                                background: compromissosNaHora[0].cor,
                                position: "relative"
                              }}
                            >
                              <div className="evento-horario">{compromissosNaHora[0].horario}</div>
                              <div className="evento-titulo">{compromissosNaHora[0].nome}</div>
                              {compromissosNaHora[0].repete && (
                                <div className="evento-detalhes">🔁 {compromissosNaHora[0].frequencia}</div>
                              )}
                              {temMultiplosEventos && (
                                <div className="eventos-badge">+{compromissosNaHora.length - 1}</div>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="agenda-mensal">
            <div className="mensal-header">
              {diasDaSemana.map(dia => (
                <div key={dia} className="mensal-dia-semana">{dia}</div>
              ))}
            </div>
            <div className="mensal-grid">
              {/* Espaços vazios antes do primeiro dia do mês */}
              {Array.from({ length: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`vazio-${i}`} className="mensal-dia-vazio"></div>
              ))}
              
              {diasMes.map((item, index) => {
                const bateriasDoDia = getBateriasDoDia(item.data);
                const compromissosDoDia = getCompromissosDoDia(item.data);
                const isHoje = item.data.toDateString() === new Date().toDateString();
                const todosEventos = [...bateriasDoDia, ...compromissosDoDia];
                
                return (
                  <div
                    key={index}
                    className={`mensal-dia ${isHoje ? "hoje" : ""}`}
                    onClick={() => abrirDetalhesDia(item.data)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="mensal-dia-numero">{item.data.getDate()}</div>
                    <div className="mensal-eventos">
                      {bateriasDoDia.slice(0, 2).map(bateria => {
                        const pilotos = getPilotosDaBateria(bateria);
                        return (
                          <button
                            key={bateria.id}
                            className="mensal-evento"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirDetalhes(bateria);
                            }}
                          >
                            <span className="evento-hora">{bateria.horario}</span>
                            <span className="evento-info">{pilotos.length}/{bateria.kartsDisponiveis}</span>
                          </button>
                        );
                      })}
                      {compromissosDoDia.slice(0, 2 - Math.min(bateriasDoDia.length, 2)).map(comp => (
                        <button
                          key={comp.id}
                          className="mensal-evento"
                          style={{ background: comp.cor }}
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirDetalhesCompromisso(comp);
                          }}
                        >
                          <span className="evento-hora">{comp.horario}</span>
                          <span className="evento-info">{comp.nome}</span>
                        </button>
                      ))}
                      {todosEventos.length > 2 && (
                        <div className="mensal-mais">+{todosEventos.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {bateriaDetalhes && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Bateria</h2>
              <button className="modal-fechar" onClick={fecharDetalhes}>✕</button>
            </div>

            <div className="modal-body">
              <div className="bateria-info">
                <div className="info-item">
                  <span className="info-label">Data:</span>
                  <span className="info-valor">
                    {new Date(bateriaDetalhes.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Horário:</span>
                  <span className="info-valor">{bateriaDetalhes.horario}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duração:</span>
                  <span className="info-valor">{bateriaDetalhes.duracaoMinutos} min</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Karts Disponíveis:</span>
                  <span className="info-valor">{bateriaDetalhes.kartsDisponiveis}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Vagas Restantes:</span>
                  <span className="info-valor destaque" style={{ color: getVagasRestantes(bateriaDetalhes) > 0 ? '#16a34a' : '#e74c3c' }}>
                    {getVagasRestantes(bateriaDetalhes)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Valor por Piloto:</span>
                  <span className="info-valor">{currencyFormatter.format(bateriaDetalhes.valorPorPiloto)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Faturamento da Bateria:</span>
                  <span className="info-valor destaque">{currencyFormatter.format(getFaturamentoBateria(bateriaDetalhes))}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Faturamento Potencial:</span>
                  <span className="info-valor">{currencyFormatter.format(bateriaDetalhes.valorTotal)}</span>
                </div>
              </div>

              <div className="pilotos-lista">
                <h3>Pilotos Agendados ({pilotosDaBateriaDetalhada.length}/{bateriaDetalhes.kartsDisponiveis})</h3>
                
                {pilotosDaBateriaDetalhada.length === 0 ? (
                  <p className="sem-pilotos">Nenhum piloto agendado para esta bateria</p>
                ) : (
                  <div className="tabela-pilotos">
                    <table>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>CPF</th>
                          <th>Telefone</th>
                          <th>Status</th>
                          <th>Check-in</th>
                          <th>Pagamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pilotosDaBateriaDetalhada.map((piloto) => {
                          const statusTexto = piloto.checkIn ? "Confirmado" : "Reservado";
                          const statusClasse = piloto.checkIn ? "confirmado" : "reservado";
                          
                          return (
                            <tr key={piloto.cpf}>
                              <td>{piloto.nome}</td>
                              <td>{piloto.cpf}</td>
                              <td>{piloto.telefone}</td>
                              <td>
                                <span className={`badge badge-${statusClasse}`}>
                                  {statusTexto}
                                </span>
                              </td>
                              <td>
                                <button
                                  className={`btn-toggle ${piloto.checkIn ? "ativo" : ""}`}
                                  onClick={() => alternarCheckIn(piloto.cpf)}
                                >
                                  {piloto.checkIn ? "✓ Feito" : "Pendente"}
                                </button>
                              </td>
                              <td>
                                <button
                                  className={`btn-toggle ${piloto.pagamento ? "ativo" : ""}`}
                                  onClick={() => alternarPagamento(piloto.cpf)}
                                >
                                  {piloto.pagamento ? "✓ Pago" : "Pendente"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarModalNovoCompromisso && (
        <div className="modal-overlay" onClick={fecharModalNovoCompromisso}>
          <div className="modal-content modal-compromisso" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Compromisso</h2>
              <button className="modal-fechar" onClick={fecharModalNovoCompromisso}>✕</button>
            </div>

            <form onSubmit={salvarNovoCompromisso} className="modal-body">
              <div className="form-group">
                <label htmlFor="nomeCompromisso">Nome do Compromisso *</label>
                <input
                  type="text"
                  id="nomeCompromisso"
                  value={nomeCompromisso}
                  onChange={(e) => setNomeCompromisso(e.target.value)}
                  placeholder="Ex: Reunião de equipe, Manutenção, etc."
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dataCompromisso">Data *</label>
                  <input
                    type="date"
                    id="dataCompromisso"
                    value={dataCompromisso}
                    onChange={(e) => setDataCompromisso(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="horarioCompromisso">Horário *</label>
                  <input
                    type="time"
                    id="horarioCompromisso"
                    value={horarioCompromisso}
                    onChange={(e) => setHorarioCompromisso(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duracaoCompromisso">Duração (min)</label>
                  <input
                    type="number"
                    id="duracaoCompromisso"
                    value={duracaoCompromisso}
                    onChange={(e) => setDuracaoCompromisso(Number(e.target.value))}
                    min="15"
                    step="15"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={repeteCompromisso}
                    onChange={(e) => setRepeteCompromisso(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Este compromisso se repete</span>
                </label>
              </div>

              {repeteCompromisso && (
                <div className="form-group">
                  <label htmlFor="frequenciaCompromisso">Frequência</label>
                  <select
                    id="frequenciaCompromisso"
                    value={frequenciaCompromisso}
                    onChange={(e) => setFrequenciaCompromisso(e.target.value as "diaria" | "semanal" | "mensal")}
                    className="form-select"
                  >
                    <option value="diaria">Diariamente</option>
                    <option value="semanal">Semanalmente</option>
                    <option value="mensal">Mensalmente</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="corCompromisso">Cor do Evento</label>
                <div className="cores-opcoes">
                  {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map(cor => (
                    <button
                      key={cor}
                      type="button"
                      className={`cor-opcao ${corCompromisso === cor ? "ativa" : ""}`}
                      style={{ backgroundColor: cor }}
                      onClick={() => setCorCompromisso(cor)}
                      aria-label={`Selecionar cor ${cor}`}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notasCompromisso">Notas (opcional)</label>
                <textarea
                  id="notasCompromisso"
                  value={notasCompromisso}
                  onChange={(e) => setNotasCompromisso(e.target.value)}
                  placeholder="Adicione observações sobre este compromisso..."
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={fecharModalNovoCompromisso} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  Criar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {compromissoDetalhes && (
        <div className="modal-overlay" onClick={fecharDetalhesCompromisso}>
          <div className="modal-content modal-compromisso" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicao ? "Editar Compromisso" : "Detalhes do Compromisso"}</h2>
              <button className="modal-fechar" onClick={fecharDetalhesCompromisso}>✕</button>
            </div>

            {!modoEdicao ? (
              <div className="modal-body">
                <div className="compromisso-detalhes">
                  <div className="detalhe-item">
                    <strong>Nome:</strong>
                    <span>{compromissoDetalhes.nome}</span>
                  </div>

                  <div className="detalhe-item">
                    <strong>Data:</strong>
                    <span>{new Date(compromissoDetalhes.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>

                  <div className="detalhe-item">
                    <strong>Horário:</strong>
                    <span>{compromissoDetalhes.horario}</span>
                  </div>

                  <div className="detalhe-item">
                    <strong>Duração:</strong>
                    <span>{compromissoDetalhes.duracao} minutos</span>
                  </div>

                  {compromissoDetalhes.repete && (
                    <div className="detalhe-item">
                      <strong>Repetição:</strong>
                      <span>🔁 {compromissoDetalhes.frequencia === "diaria" ? "Diariamente" : compromissoDetalhes.frequencia === "semanal" ? "Semanalmente" : "Mensalmente"}</span>
                    </div>
                  )}

                  <div className="detalhe-item">
                    <strong>Cor:</strong>
                    <div style={{ 
                      width: "30px", 
                      height: "30px", 
                      backgroundColor: compromissoDetalhes.cor, 
                      borderRadius: "4px",
                      border: "1px solid #ddd"
                    }}></div>
                  </div>

                  {compromissoDetalhes.notas && (
                    <div className="detalhe-item">
                      <strong>Notas:</strong>
                      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{compromissoDetalhes.notas}</p>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" onClick={excluirCompromissoAtual} className="btn-excluir">
                    🗑️ Excluir
                  </button>
                  <button type="button" onClick={ativarModoEdicao} className="btn-editar">
                    ✏️ Editar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={salvarEdicaoCompromisso} className="modal-body">
                <div className="form-group">
                  <label htmlFor="nomeCompromissoEdit">Nome do Compromisso *</label>
                  <input
                    type="text"
                    id="nomeCompromissoEdit"
                    value={nomeCompromisso}
                    onChange={(e) => setNomeCompromisso(e.target.value)}
                    placeholder="Ex: Reunião de equipe, Manutenção, etc."
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dataCompromissoEdit">Data *</label>
                    <input
                      type="date"
                      id="dataCompromissoEdit"
                      value={dataCompromisso}
                      onChange={(e) => setDataCompromisso(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="horarioCompromissoEdit">Horário *</label>
                    <input
                      type="time"
                      id="horarioCompromissoEdit"
                      value={horarioCompromisso}
                      onChange={(e) => setHorarioCompromisso(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="duracaoCompromissoEdit">Duração (min)</label>
                    <input
                      type="number"
                      id="duracaoCompromissoEdit"
                      value={duracaoCompromisso}
                      onChange={(e) => setDuracaoCompromisso(Number(e.target.value))}
                      min="15"
                      step="15"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={repeteCompromisso}
                      onChange={(e) => setRepeteCompromisso(e.target.checked)}
                      className="form-checkbox"
                    />
                    <span>Este compromisso se repete</span>
                  </label>
                </div>

                {repeteCompromisso && (
                  <div className="form-group">
                    <label htmlFor="frequenciaCompromissoEdit">Frequência</label>
                    <select
                      id="frequenciaCompromissoEdit"
                      value={frequenciaCompromisso}
                      onChange={(e) => setFrequenciaCompromisso(e.target.value as "diaria" | "semanal" | "mensal")}
                      className="form-select"
                    >
                      <option value="diaria">Diariamente</option>
                      <option value="semanal">Semanalmente</option>
                      <option value="mensal">Mensalmente</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="corCompromissoEdit">Cor do Evento</label>
                  <div className="cores-opcoes">
                    {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map(cor => (
                      <button
                        key={cor}
                        type="button"
                        className={`cor-opcao ${corCompromisso === cor ? "ativa" : ""}`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setCorCompromisso(cor)}
                        aria-label={`Selecionar cor ${cor}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notasCompromissoEdit">Notas (opcional)</label>
                  <textarea
                    id="notasCompromissoEdit"
                    value={notasCompromisso}
                    onChange={(e) => setNotasCompromisso(e.target.value)}
                    placeholder="Adicione observações sobre este compromisso..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setModoEdicao(false)} className="btn-cancelar">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-salvar">
                    Salvar Alterações
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {diaDetalhes && (
        <div className="modal-overlay" onClick={fecharDetalhesDia}>
          <div className="modal-content modal-dia-detalhes" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {diasDaSemanaCompleto[diaDetalhes.getDay()]}, {diaDetalhes.getDate()} de {meses[diaDetalhes.getMonth()]} de {diaDetalhes.getFullYear()}
              </h2>
              <button className="modal-fechar" onClick={fecharDetalhesDia}>✕</button>
            </div>

            <div className="modal-body">
              {(() => {
                const bateriasDoDia = getBateriasDoDia(diaDetalhes);
                const compromissosDoDia = getCompromissosDoDia(diaDetalhes);
                const temEventos = bateriasDoDia.length > 0 || compromissosDoDia.length > 0;

                if (!temEventos) {
                  return (
                    <div className="sem-eventos">
                      <p>📅 Nenhum compromisso agendado para este dia.</p>
                    </div>
                  );
                }

                return (
                  <div className="dia-eventos-lista">
                    {bateriasDoDia.length > 0 && (
                      <div className="eventos-secao">
                        <h3>🏎️ Baterias Agendadas</h3>
                        {bateriasDoDia.map(bateria => {
                          const pilotos = getPilotosDaBateria(bateria);
                          return (
                            <div key={bateria.id} className="evento-item bateria-item">
                              <div className="evento-item-header">
                                <span className="evento-item-horario">{bateria.horario}</span>
                                <span className="evento-item-titulo">Bateria #{bateria.id}</span>
                              </div>
                              <div className="evento-item-detalhes">
                                <span>⏱️ {bateria.duracaoMinutos} minutos</span>
                                <span>👥 {pilotos.length}/{bateria.kartsDisponiveis} pilotos</span>
                                <span>💰 {currencyFormatter.format(bateria.valorPorPiloto)}/piloto</span>
                              </div>
                              <button 
                                className="btn-ver-detalhes"
                                onClick={() => {
                                  abrirDetalhes(bateria);
                                  fecharDetalhesDia();
                                }}
                              >
                                Ver detalhes
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {compromissosDoDia.length > 0 && (
                      <div className="eventos-secao">
                        <h3>📅 Compromissos</h3>
                        {compromissosDoDia.map(comp => (
                          <div 
                            key={comp.id} 
                            className="evento-item compromisso-item" 
                            style={{ borderLeftColor: comp.cor, cursor: 'pointer' }}
                            onClick={() => {
                              abrirDetalhesCompromisso(comp);
                              fecharDetalhesDia();
                            }}
                          >
                            <div className="evento-item-header">
                              <span className="evento-item-horario">{comp.horario}</span>
                              <span className="evento-item-titulo">{comp.nome}</span>
                            </div>
                            <div className="evento-item-detalhes">
                              <span>⏱️ {comp.duracao} minutos</span>
                              {comp.repete && (
                                <span>🔁 Repete {comp.frequencia === "diaria" ? "diariamente" : comp.frequencia === "semanal" ? "semanalmente" : "mensalmente"}</span>
                              )}
                            </div>
                            {comp.notas && (
                              <div className="evento-item-notas">
                                📝 {comp.notas}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {eventosHorario && (
        <div className="modal-overlay" onClick={fecharEventosHorario}>
          <div className="modal-content modal-eventos-horario" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Eventos neste horário</h2>
              <button className="modal-fechar" onClick={fecharEventosHorario}>✕</button>
            </div>

            <div className="modal-body">
              <div className="eventos-horario-lista">
                {eventosHorario.bateria && (
                  <button
                    className="evento-horario-item bateria-item"
                    onClick={() => {
                      abrirDetalhes(eventosHorario.bateria!);
                      fecharEventosHorario();
                    }}
                  >
                    <div className="evento-horario-header">
                      <span className="evento-horario-tipo">🏁 Bateria</span>
                      <span className="evento-horario-hora">{eventosHorario.bateria.horario}</span>
                    </div>
                    <div className="evento-horario-titulo">Bateria #{eventosHorario.bateria.id}</div>
                    <div className="evento-horario-detalhes">
                      {getPilotosDaBateria(eventosHorario.bateria).length}/{eventosHorario.bateria.kartsDisponiveis} pilotos • {eventosHorario.bateria.duracaoMinutos} min
                    </div>
                  </button>
                )}

                {eventosHorario.compromissos.map(comp => (
                  <button
                    key={comp.id}
                    className="evento-horario-item compromisso-horario-item"
                    style={{ borderLeftColor: comp.cor }}
                    onClick={() => {
                      abrirDetalhesCompromisso(comp);
                      fecharEventosHorario();
                    }}
                  >
                    <div className="evento-horario-header">
                      <span className="evento-horario-tipo">📅 Compromisso</span>
                      <span className="evento-horario-hora">{comp.horario}</span>
                    </div>
                    <div className="evento-horario-titulo">{comp.nome}</div>
                    <div className="evento-horario-detalhes">
                      ⏱️ {comp.duracao} min
                      {comp.repete && ` • 🔁 ${comp.frequencia === "diaria" ? "Diário" : comp.frequencia === "semanal" ? "Semanal" : "Mensal"}`}
                    </div>
                    {comp.notas && (
                      <div className="evento-horario-notas">📝 {comp.notas}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarModalProgramados && (
        <div className="modal-overlay" onClick={fecharModalProgramados}>
          <div className="modal-content modal-programados" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Compromissos Programados</h2>
              <button className="modal-fechar" onClick={fecharModalProgramados}>✕</button>
            </div>

            <div className="modal-body">
              {compromissos.length === 0 ? (
                <div className="sem-eventos">
                  <p>📅 Nenhum compromisso programado ainda.</p>
                </div>
              ) : (
                <div className="programados-lista">
                  {/* Compromissos que se repetem */}
                  {compromissosUnicos.length > 0 && (
                    <div className="programados-secao">
                      <h3>🔁 Compromissos Recorrentes</h3>
                      {compromissosUnicos.map(comp => {
                        const totalOcorrencias = compromissos.filter(c => c.nome === comp.nome).length;
                        return (
                          <div key={comp.id} className="programado-item" style={{ borderLeftColor: comp.cor }}>
                            <div className="programado-header">
                              <div className="programado-info">
                                <div className="programado-nome">{comp.nome}</div>
                                <div className="programado-detalhes">
                                  <span>🔁 Repete {comp.frequencia === "diaria" ? "diariamente" : comp.frequencia === "semanal" ? "semanalmente" : "mensalmente"}</span>
                                  <span>⏱️ {comp.horario} - {comp.duracao} min</span>
                                  <span>📊 {totalOcorrencias} ocorrências</span>
                                </div>
                                {comp.notas && (
                                  <div className="programado-notas">📝 {comp.notas}</div>
                                )}
                              </div>
                              <button 
                                className="btn-excluir-serie"
                                onClick={() => excluirSerieCompromisso(comp.nome)}
                                title="Excluir toda a série"
                              >
                                🗑️ Excluir série
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Compromissos únicos (não recorrentes) */}
                  {(() => {
                    const unicos = compromissos.filter(c => !c.repete);
                    if (unicos.length === 0) return null;
                    
                    return (
                      <div className="programados-secao">
                        <h3>📅 Compromissos Únicos</h3>
                        {unicos.map(comp => (
                          <div key={comp.id} className="programado-item" style={{ borderLeftColor: comp.cor }}>
                            <div className="programado-header">
                              <div className="programado-info">
                                <div className="programado-nome">{comp.nome}</div>
                                <div className="programado-detalhes">
                                  <span>📅 {new Date(comp.data + "T00:00:00").toLocaleDateString('pt-BR')}</span>
                                  <span>⏱️ {comp.horario} - {comp.duracao} min</span>
                                </div>
                                {comp.notas && (
                                  <div className="programado-notas">📝 {comp.notas}</div>
                                )}
                              </div>
                              <button 
                                className="btn-excluir"
                                onClick={() => excluirCompromisso(comp.id)}
                                title="Excluir compromisso"
                              >
                                🗑️ Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
