import { useState } from "react";

const AGENDAMENTOS_STORAGE_KEY = "kartodromo_agendamentos";

type BateriaOpcao = {
  id: string;
  horario: string;
  nome: string;
  vagasRestantes: number;
};

type AgendamentoSalvo = {
  cpf: string;
  nome: string;
  telefone: string;
  bateria: string;
  horario: string;
  status: "pendente" | "confirmado";
};

const bateriasDisponiveis: BateriaOpcao[] = [
  { id: "b1", horario: "14:00", nome: "Bateria 01", vagasRestantes: 2 },
  { id: "b2", horario: "14:30", nome: "Bateria 02", vagasRestantes: 3 },
  { id: "b3", horario: "15:00", nome: "Bateria 03", vagasRestantes: 1 },
  { id: "b4", horario: "15:30", nome: "Bateria 04", vagasRestantes: 4 },
];

export function Agendamentos() {
  const [bateriaSelecionada, setBateriaSelecionada] = useState<string>("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const bateriaAtual = bateriasDisponiveis.find(
    (b) => b.id === bateriaSelecionada
  );

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

    const novoAgendamento: AgendamentoSalvo = {
      cpf: cpf.trim(),
      nome: nome.trim(),
      telefone: telefone.trim(),
      bateria: bateriaAtual.nome,
      horario: bateriaAtual.horario,
      status: "pendente",
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
    } catch {
      // se der erro no localStorage, apenas segue com a confirmação visual
    }

    setMensagemSucesso(
      `Reserva recebida para ${nome} na ${bateriaAtual?.nome} às ${bateriaAtual?.horario}.`
    );
  }

  return (
    <div className="agendamentos">
      <header className="agendamentos-header">
        <div>
          <h1>Agende sua bateria</h1>
          <p className="agendamentos-subtitle">
            Escolha um horário e preencha seus dados para garantir sua vaga.
          </p>
        </div>
      </header>

      <div className="agendamentos-layout">
        <section className="agendamentos-baterias">
          <h2>Escolha a bateria</h2>
          <p className="agendamentos-texto-ajuda">
            Selecione o horário desejado. Cada bateria tem número limitado de
            vagas.
          </p>

          <div className="agendamentos-baterias-lista">
            {bateriasDisponiveis.map((bateria) => (
              <button
                key={bateria.id}
                type="button"
                className={
                  "bateria-card " +
                  (bateriaSelecionada === bateria.id ? "bateria-card-ativa" : "")
                }
                onClick={() => setBateriaSelecionada(bateria.id)}
              >
                <div className="bateria-card-horario">{bateria.horario}</div>
                <div className="bateria-card-nome">{bateria.nome}</div>
                <div className="bateria-card-vagas">
                  {bateria.vagasRestantes} vaga
                  {bateria.vagasRestantes > 1 ? "s" : ""} restantes
                </div>
              </button>
            ))}
          </div>
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
