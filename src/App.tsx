import { useState } from "react";
import "./styles.css";
import { Dashboard } from "./pages/Dashboard";
import { Agendamentos } from "./pages/Agendamentos";
import { Checkin } from "./pages/Checkin";
import { Baterias } from "./pages/Baterias";
import { Relatorios } from "./pages/Relatorios";
import { Custos } from "./pages/Custos";

type Aba =
  | "dashboard"
  | "agendamentos"
  | "checkin"
  | "baterias"
  | "custos"
  | "relatorios";

type AppProps = {
  onLogout: () => void;
};

export default function App({ onLogout }: AppProps) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("relatorios");
  const [menuColapsado, setMenuColapsado] = useState(false);

  const renderConteudo = () => {
    switch (abaAtiva) {
      case "dashboard":
        return <Dashboard />;
      case "agendamentos":
        return <Agendamentos />;
      case "checkin":
        return (
          <Checkin onIrParaAgendamentos={() => setAbaAtiva("agendamentos")} />
        );
      case "baterias":
        return <Baterias />;
      case "custos":
        return <Custos />;
      case "relatorios":
        return <Relatorios />;
      default:
        return null;
    }
  };

  const handleCliqueMenu = (aba: Aba) => {
    setAbaAtiva(aba);
    if (window.innerWidth <= 768) {
      setMenuColapsado(false);
    }
  };

  return (
    <div className={"app-container " + (menuColapsado ? "menu-colapsado" : "")}>
      <button
        type="button"
        className="menu-mobile-toggle"
        onClick={() => setMenuColapsado((valor) => !valor)}
        aria-label={menuColapsado ? "Fechar menu" : "Abrir menu"}
      >
        ☰
      </button>

      <aside className="sidebar">
        <div className="sidebar-topo">
          <div className="logo">
            <span className="logo-marca">Kartódromo</span>
            <span className="logo-sub">Painel de Gestão</span>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setMenuColapsado((valor) => !valor)}
            aria-label={menuColapsado ? "Expandir menu" : "Recolher menu"}
          >
            {menuColapsado ? "›" : "‹"}
          </button>
        </div>

        <nav className="menu">
          <button
            className={
              "menu-item " + (abaAtiva === "relatorios" ? "ativo" : "")
            }
            onClick={() => handleCliqueMenu("relatorios")}
          >
            <span className="menu-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 18V6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M6 17.5L11 12L14 14.5L19 9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="11"
                  cy="12"
                  r="0.7"
                  fill="currentColor"
                />
                <circle
                  cx="14"
                  cy="14.5"
                  r="0.7"
                  fill="currentColor"
                />
                <circle
                  cx="19"
                  cy="9"
                  r="0.7"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="menu-label">Dashboard Financeiro</span>
          </button>
          <button
            className={
              "menu-item " + (abaAtiva === "dashboard" ? "ativo" : "")
            }
            onClick={() => handleCliqueMenu("dashboard")}
          >
            <span className="menu-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <line
                  x1="4"
                  y1="9"
                  x2="20"
                  y2="9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </span>
            <span className="menu-label">Hoje</span>
          </button>
          <button
            className={
              "menu-item " + (abaAtiva === "agendamentos" ? "ativo" : "")
            }
            onClick={() => handleCliqueMenu("agendamentos")}
          >
            <span className="menu-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <line
                  x1="4"
                  y1="9"
                  x2="20"
                  y2="9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <line
                  x1="9"
                  y1="3.5"
                  x2="9"
                  y2="7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <line
                  x1="15"
                  y1="3.5"
                  x2="15"
                  y2="7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="menu-label">Agendamentos</span>
          </button>
          <button
            className={
              "menu-item " + (abaAtiva === "checkin" ? "ativo" : "")
            }
            onClick={() => handleCliqueMenu("checkin")}
          >
            <span className="menu-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle
                  cx="10"
                  cy="11"
                  r="1.6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M7.5 16.5C8.3 15.4 9.4 14.8 10.6 14.8C11.8 14.8 12.9 15.4 13.7 16.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="14.5"
                  y1="11"
                  x2="17.5"
                  y2="11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="menu-label">Check-in</span>
          </button>
          <button
            className={
              "menu-item " + (abaAtiva === "baterias" ? "ativo" : "")
            }
            onClick={() => handleCliqueMenu("baterias")}
          >
            <span className="menu-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4V20"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M7 5H17C17.6 5 18 5.4 18 6V12C18 12.6 17.6 13 17 13H7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 5L13.5 8L16 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="menu-label">Baterias</span>
          </button>
          <button
            className={
              "menu-item " + (abaAtiva === "custos" ? "ativo" : "")
            }
            onClick={() => handleCliqueMenu("custos")}
          >
            <span className="menu-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M10 9C10.4 8.4 11.1 8 12 8C13.1 8 14 8.7 14 9.8C14 10.9 13.4 11.4 12.6 11.7C11.8 12 11.4 12.2 11.1 12.4C10.5 12.8 10.2 13.3 10.2 14"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 7V8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M12 16V17"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="menu-label">Custos</span>
          </button>
          
        </nav>

        <button className="botao-sair" onClick={onLogout}>
          Sair
        </button>
      </aside>

      <main className="conteudo">{renderConteudo()}</main>
    </div>
  );
}
