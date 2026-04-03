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

export function Baterias() {
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState("");
  const [kartsDisponiveis, setKartsDisponiveis] = useState("");
  const [valorPorPiloto, setValorPorPiloto] = useState("");
  const [editando, setEditando] = useState<number | null>(null);

  useEffect(() => {
    // Carrega baterias do localStorage
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
        setBaterias([]);
      }
    } catch {
      setBaterias([]);
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

  function handleEditarBateria(bateria: Bateria) {
    setEditando(bateria.id);
    setData(bateria.data);
    setHorario(bateria.horario);
    setDuracaoMinutos(String(bateria.duracaoMinutos));
    setKartsDisponiveis(String(bateria.kartsDisponiveis));
    setValorPorPiloto(String(bateria.valorPorPiloto));
  }

  function handleSalvarEdicao(event: FormEvent) {
    event.preventDefault();

    if (!data || !horario || !duracaoMinutos || !kartsDisponiveis || !valorPorPiloto || editando === null) {
      return;
    }

    const valorPorPilotoNumero = Number(valorPorPiloto);
    const kartsNumero = Number(kartsDisponiveis);

    const bateriasAtualizadas = baterias.map(bateria => 
      bateria.id === editando
        ? {
            ...bateria,
            data,
            horario,
            duracaoMinutos: Number(duracaoMinutos),
            kartsDisponiveis: kartsNumero,
            valorPorPiloto: valorPorPilotoNumero,
            valorTotal: valorPorPilotoNumero * kartsNumero,
          }
        : bateria
    );

    setBaterias(bateriasAtualizadas);

    try {
      localStorage.setItem(BATERIAS_STORAGE_KEY, JSON.stringify(bateriasAtualizadas));
    } catch {
      // se não conseguir salvar, mantemos apenas em memória
    }

    setEditando(null);
    setData("");
    setHorario("");
    setDuracaoMinutos("");
    setKartsDisponiveis("");
    setValorPorPiloto("");
  }

  function handleCancelarEdicao() {
    setEditando(null);
    setData("");
    setHorario("");
    setDuracaoMinutos("");
    setKartsDisponiveis("");
    setValorPorPiloto("");
  }

  function handleExcluirBateria(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta bateria?")) {
      return;
    }

    const bateriasAtualizadas = baterias.filter(bateria => bateria.id !== id);
    setBaterias(bateriasAtualizadas);

    try {
      localStorage.setItem(BATERIAS_STORAGE_KEY, JSON.stringify(bateriasAtualizadas));
    } catch {
      // se não conseguir salvar, mantemos apenas em memória
    }
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
              <span>Ações</span>
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
                <span className="baterias-acoes">
                  <button 
                    className="btn-editar"
                    onClick={() => handleEditarBateria(bateria)}
                    title="Editar bateria"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-excluir"
                    onClick={() => handleExcluirBateria(bateria.id)}
                    title="Excluir bateria"
                  >
                    🗑️
                  </button>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="baterias-form-wrapper">
          <h2>{editando ? "Editar bateria" : "Criar nova bateria"}</h2>
          <p className="baterias-texto-ajuda">
            Preencha os dados abaixo para {editando ? "atualizar" : "adicionar um novo"} horário de corrida.
          </p>

          <form className="baterias-form" onSubmit={editando ? handleSalvarEdicao : handleCriarBateria}>
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

            <div className="baterias-form-acoes">
              {editando && (
                <button 
                  type="button" 
                  className="botao-secundario"
                  onClick={handleCancelarEdicao}
                >
                  Cancelar
                </button>
              )}
              <button type="submit" className="botao-primario">
                {editando ? "Salvar alterações" : "Criar bateria"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
