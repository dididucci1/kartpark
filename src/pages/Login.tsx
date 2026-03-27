import { FormEvent, useState } from "react";

type LoginProps = {
  onLogin: () => void;
};

export function Login({ onLogin }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!usuario || !senha) {
      setErro("Informe usuário e senha.");
      return;
    }

    setErro(null);
    onLogin();
  }

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-header">
          <h1>Sistema para kartódromo</h1>
          <p>Acesse o painel de gestão para acompanhar o dia.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="campo-form">
            <label htmlFor="usuario">Usuário</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Digite seu usuário"
            />
          </div>

          <div className="campo-form">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
            />
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" className="botao-primario login-botao">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
