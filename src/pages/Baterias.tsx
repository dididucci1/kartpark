import { useState, useEffect, FormEvent } from "react";

type Bateria = {
  id: number;
  data: string;
  horario: string;
  duracaoMinutos: number;
  kartsDisponiveis: number;
  valorPorPiloto: number;
  valorTotal: number;
};

const BATERIAS_STORAGE_KEY = "kartodromo_baterias";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const bateriasIniciais: Bateria[] = [
  {
    id: 1,
    data: "2026-03-27",
    horario: "14:00",
    duracaoMinutos: 15,
    kartsDisponiveis: 12,
    valorPorPiloto: 150,
    valorTotal: 150 * 12,
  },
  {
    id: 2,
    data: "2026-03-27",
    horario: "14:30",
    duracaoMinutos: 15,
    kartsDisponiveis: 10,
    valorPorPiloto: 150,
    valorTotal: 150 * 10,
  },
  {
    id: 3,
    data: "2026-03-27",
    horario: "15:00",
    duracaoMinutos: 20,
    kartsDisponiveis: 8,
    valorPorPiloto: 150,
    valorTotal: 150 * 8,
  },
];

export function Baterias() {
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState("");
  const [kartsDisponiveis, setKartsDisponiveis] = useState("");
  const [valorPorPiloto, setValorPorPiloto] = useState("");

  useEffect(() => {
    try {
      const armazenado = localStorage.getItem(BATERIAS_STORAGE_KEY);
      if (armazenado) {
        const listaArmazenada: Bateria[] = JSON.parse(armazenado);
        const listaNormalizada: Bateria[] = listaArmazenada.map((bateria) => {
          const valorPorPiloto =
            typeof bateria.valorPorPiloto === "number"
              ? bateria.valorPorPiloto
              : 0;

          const valorTotal =
            typeof bateria.valorTotal === "number"
              ? bateria.valorTotal
              : valorPorPiloto && bateria.kartsDisponiveis
              ? valorPorPiloto * bateria.kartsDisponiveis
              : 0;

          return {
            ...bateria,
            valorPorPiloto,
            valorTotal,
          };
        });

        setBaterias(listaNormalizada);
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

    if (!data || !horario || !duracaoMinutos || !kartsDisponiveis || !valorPorPiloto) {
      return;
    }

    const valorPorPilotoNumero = Number(valorPorPiloto);
    const kartsNumero = Number(kartsDisponiveis);

    const novaBateria: Bateria = {
      id: baterias.length + 1,
      data,
      horario,
      duracaoMinutos: Number(duracaoMinutos),
      kartsDisponiveis: kartsNumero,
      valorPorPiloto: valorPorPilotoNumero,
      valorTotal: valorPorPilotoNumero * kartsNumero,
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
    setValorPorPiloto("");
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
              <span>Valor / piloto</span>
              <span>Valor total</span>
            </div>
            {baterias.map((bateria) => (
              <div key={bateria.id} className="baterias-tabela-linha">
                <span>
                  {new Date(bateria.data + "T00:00").toLocaleDateString("pt-BR")}
                </span>
                <span>{bateria.horario}</span>
                <span>{bateria.duracaoMinutos} min</span>
                <span>{bateria.kartsDisponiveis}</span>
                <span>
                  {bateria.valorPorPiloto
                    ? currencyFormatter.format(bateria.valorPorPiloto)
                    : "-"}
                </span>
                <span>
                  {bateria.valorTotal
                    ? currencyFormatter.format(bateria.valorTotal)
                    : "-"}
                </span>
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

            <div className="campo-form">
              <label htmlFor="valorPorPiloto">Valor por piloto (R$)</label>
              <input
                id="valorPorPiloto"
                type="number"
                min={0}
                step={10}
                value={valorPorPiloto}
                onChange={(event) => setValorPorPiloto(event.target.value)}
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
