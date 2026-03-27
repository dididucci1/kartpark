import { useState, useEffect, FormEvent } from "react";

type Bateria = {
  id: number;
  data: string;
  horario: string;
  duracaoMinutos: number;
  kartsDisponiveis: number;
};

const BATERIAS_STORAGE_KEY = "kartodromo_baterias";

const bateriasIniciais: Bateria[] = [
  {
    id: 1,
    data: "2026-03-27",
    horario: "14:00",
    duracaoMinutos: 15,
    kartsDisponiveis: 12,
  },
  {
    id: 2,
    data: "2026-03-27",
    horario: "14:30",
    duracaoMinutos: 15,
    kartsDisponiveis: 10,
  },
  {
    id: 3,
    data: "2026-03-27",
    horario: "15:00",
    duracaoMinutos: 20,
    kartsDisponiveis: 8,
  },
];

export function Baterias() {
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState("");
  const [kartsDisponiveis, setKartsDisponiveis] = useState("");

  useEffect(() => {
    try {
      const armazenado = localStorage.getItem(BATERIAS_STORAGE_KEY);
      if (armazenado) {
        const lista: Bateria[] = JSON.parse(armazenado);
        setBaterias(lista);
      } else {
        setBaterias(bateriasIniciais);
        localStorage.setItem(
          BATERIAS_STORAGE_KEY,
          JSON.stringify(bateriasIniciais)
        );
      }
    } catch {
      setBaterias(bateriasIniciais);
    }
  }, []);

  function handleCriarBateria(event: FormEvent) {
    event.preventDefault();

    if (!data || !horario || !duracaoMinutos || !kartsDisponiveis) {
      return;
    }

    const novaBateria: Bateria = {
      id: baterias.length + 1,
      data,
      horario,
      duracaoMinutos: Number(duracaoMinutos),
      kartsDisponiveis: Number(kartsDisponiveis),
    };

    const listaAtualizada = [...baterias, novaBateria];
    setBaterias(listaAtualizada);

    try {
      localStorage.setItem(
        BATERIAS_STORAGE_KEY,
        JSON.stringify(listaAtualizada)
      );
    } catch {
      // se não conseguir salvar, mantemos apenas em memória
    }

    setData("");
    setHorario("");
    setDuracaoMinutos("");
    setKartsDisponiveis("");
  }

  return (
    <div className="baterias">
      <div className="baterias-header">
        <div>
          <h1>Baterias do dia</h1>
          <p className="baterias-subtitle">
            Veja os horários de corrida já cadastrados e crie novas baterias.
          </p>
        </div>
      </div>

      <div className="baterias-layout">
        <section className="baterias-lista-wrapper">
          <div className="baterias-lista-header">
            <h2>Baterias cadastradas</h2>
            <span className="baterias-lista-contador">
              {baterias.length} bateria(s)
            </span>
          </div>

          <div className="baterias-tabela">
            <div className="baterias-tabela-header">
              <span>Data</span>
              <span>Horário</span>
              <span>Duração</span>
              <span>Karts disponíveis</span>
            </div>
            {baterias.map((bateria) => (
              <div key={bateria.id} className="baterias-tabela-linha">
                <span>
                  {new Date(bateria.data + "T00:00").toLocaleDateString("pt-BR")}
                </span>
                <span>{bateria.horario}</span>
                <span>{bateria.duracaoMinutos} min</span>
                <span>{bateria.kartsDisponiveis}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="baterias-form-wrapper">
          <h2>Criar nova bateria</h2>
          <p className="baterias-texto-ajuda">
            Preencha os dados abaixo para adicionar um novo horário de corrida.
          </p>

          <form className="baterias-form" onSubmit={handleCriarBateria}>
            <div className="campo-form">
              <label htmlFor="data">Data</label>
              <input
                id="data"
                type="date"
                value={data}
                onChange={(event) => setData(event.target.value)}
              />
            </div>

            <div className="campo-form">
              <label htmlFor="horario">Horário</label>
              <input
                id="horario"
                type="time"
                value={horario}
                onChange={(event) => setHorario(event.target.value)}
              />
            </div>

            <div className="campo-form">
              <label htmlFor="duracao">Duração (minutos)</label>
              <input
                id="duracao"
                type="number"
                min={5}
                step={5}
                value={duracaoMinutos}
                onChange={(event) => setDuracaoMinutos(event.target.value)}
              />
            </div>

            <div className="campo-form">
              <label htmlFor="karts">Quantidade de karts disponíveis</label>
              <input
                id="karts"
                type="number"
                min={1}
                value={kartsDisponiveis}
                onChange={(event) => setKartsDisponiveis(event.target.value)}
              />
            </div>

            <button type="submit" className="botao-primario">
              Salvar bateria
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
