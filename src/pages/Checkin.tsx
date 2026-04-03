import { useState } from "react";

const AGENDAMENTOS_STORAGE_KEY = "kartodromo_agendamentos";

type CheckinProps = {
  onIrParaAgendamentos?: () => void;
};

type CheckinReserva = {
  cpf: string;
  nome: string;
  bateria: string;
  horario: string;
  telefone: string;
  status: "pendente" | "confirmado";
  checkIn?: boolean;
  pagamento?: boolean;
  bateriaId?: number;
  data?: string;
};

export function Checkin({ onIrParaAgendamentos }: CheckinProps) {
  const [cpfBusca, setCpfBusca] = useState("");
  const [reservaEncontrada, setReservaEncontrada] =
    useState<CheckinReserva | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  function handleBuscar() {
    const cpfLimpado = cpfBusca.trim();

    try {
      const armazenado = localStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
      const reservas: CheckinReserva[] = armazenado
        ? JSON.parse(armazenado)
        : [];

      const reservasDoCpf = reservas.filter((r) => r.cpf === cpfLimpado);
      const reserva =
        reservasDoCpf.length > 0
          ? reservasDoCpf[reservasDoCpf.length - 1]
          : null;

      if (!reserva) {
        setReservaEncontrada(null);
        setMensagem("Nenhuma reserva encontrada para este CPF.");
        return;
      }

      setReservaEncontrada(reserva);
      setMensagem(null);
    } catch {
      setReservaEncontrada(null);
      setMensagem("Não foi possível buscar os agendamentos salvos.");
    }
  }

  function handleConfirmarCheckin() {
    if (!reservaEncontrada) return;

    const atualizada: CheckinReserva = {
      ...reservaEncontrada,
      status: "confirmado",
      checkIn: true,
    };

    setReservaEncontrada(atualizada);
    setMensagem("Check-in realizado com sucesso!");

    try {
      const armazenado = localStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
      const reservas: CheckinReserva[] = armazenado
        ? JSON.parse(armazenado)
        : [];

      const reservasAtualizadas = reservas.map((r) =>
        r.cpf === atualizada.cpf ? { ...r, status: "confirmado", checkIn: true } : r
      );

      localStorage.setItem(
        AGENDAMENTOS_STORAGE_KEY,
        JSON.stringify(reservasAtualizadas)
      );
    } catch {
      // se der erro, mantém apenas no estado local
    }
  }

  function handleTelaCheia() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // ignore erro de fullscreen
      });
    }
  }

  return (
    <div className="checkin">
      <div className="checkin-centro">
        <header className="checkin-header">
          <div>
            <h1>Check-in de pilotos</h1>
            <p>Informe o CPF para localizar sua reserva do dia.</p>
          </div>
          <div className="checkin-acoes">
            <button
              type="button"
              className="checkin-acao-botao checkin-botao-fullscreen"
              onClick={handleTelaCheia}
            >
              Tela cheia
            </button>
            <button
              type="button"
              className="checkin-acao-botao checkin-acao-secundario"
              onClick={onIrParaAgendamentos}
            >
              Agendar agora
            </button>
          </div>
        </header>

        <div className="checkin-busca">
          <label htmlFor="cpf-checkin">CPF do piloto</label>
          <div className="checkin-busca-linha">
            <input
              id="cpf-checkin"
              type="text"
              value={cpfBusca}
              onChange={(e) => setCpfBusca(e.target.value)}
              placeholder="000.000.000-00"
              autoFocus
            />
            <button type="button" onClick={handleBuscar}>
              Buscar
            </button>
          </div>
        </div>

        {mensagem && !reservaEncontrada && (
          <p className="checkin-mensagem checkin-mensagem-erro">{mensagem}</p>
        )}

        {reservaEncontrada && (
          <section className="checkin-resultado">
            <h2>Dados da reserva</h2>
            <div className="checkin-resultado-grid">
              <div>
                <span className="checkin-label">Nome</span>
                <span>{reservaEncontrada.nome}</span>
              </div>
              <div>
                <span className="checkin-label">CPF</span>
                <span>{reservaEncontrada.cpf}</span>
              </div>
              <div>
                <span className="checkin-label">Bateria</span>
                <span>{reservaEncontrada.bateria}</span>
              </div>
              <div>
                <span className="checkin-label">Horário</span>
                <span>{reservaEncontrada.horario}</span>
              </div>
              <div>
                <span className="checkin-label">Telefone</span>
                <span>{reservaEncontrada.telefone}</span>
              </div>
              <div>
                <span className="checkin-label">Status</span>
                <span
                  className={
                    "status-pill " +
                    (reservaEncontrada.status === "confirmado"
                      ? "status-confirmado"
                      : "status-pendente")
                  }
                >
                  {reservaEncontrada.checkIn
                    ? "Check-in confirmado"
                    : "Reservado"}
                </span>
              </div>
            </div>

            {!reservaEncontrada.checkIn && (
              <button
                type="button"
                className="botao-primario checkin-botao"
                onClick={handleConfirmarCheckin}
              >
                Confirmar check-in
              </button>
            )}

            {mensagem && (
              <p className="checkin-mensagem checkin-mensagem-sucesso">
                {mensagem}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
