import { useState } from 'react'

export default function App() {
  const [nome, setNome] = useState('Thiago Fritz')
  const [nex, setNex] = useState(20)

  // Status do Agente
  const [vida, setVida] = useState(20)
  const [pe, setPe] = useState(5)
  const [sanidade, setSanidade] = useState(15)

  // Mensagem de retorno do Spring Boot
  const [mensagemBackend, setMensagemBackend] = useState('')

  const vidaMax = 20
  const peMax = 5
  const sanMax = 15

  // 🚀 Função para enviar os dados do agente para o Java Spring Boot
  const salvarNoJava = async () => {
    try {
      const resposta = await fetch('http://localhost:8080/api/personagens/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome,
          nex: nex,
          vida: vida,
          pe: pe,
          sanidade: sanidade
        }),
      });

      const texto = await resposta.text();
      setMensagemBackend(texto);
    } catch (erro) {
      console.error("Erro ao conectar com o Java:", erro);
      setMensagemBackend("⚠️ Erro ao conectar com o backend Spring Boot!");
    }
  };

  return (
      <div style={{
        backgroundColor: '#0f0f0f',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        margin: 0,
        padding: 0,
        overflowX: 'hidden'
      }}>

        {/* 🏞️ IMAGEM DA LATERAL ESQUERDA */}
        <div style={{
          width: '20%',
          backgroundImage: `url('/IMAGEM_3.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRight: '2px solid #c81e1e',
          boxShadow: '5px 0 15px rgba(0,0,0,0.5)',
          display: 'none' as any,
        }} className="lateral-painel" />

        {/* 🎛️ CONTEÚDO CENTRAL */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          zIndex: 2
        }}>
          {/* TÍTULO */}
          <h1
              className="estilo-paranormal"
              style={{ color: '#c81e1e', margin: '0 0 5px 0', fontSize: '3.5rem', textAlign: 'center' }}
          >
            SISTEMA DE ORDEM PARANORMAL
          </h1>

          <p style={{ color: '#aaa', fontStyle: 'italic', marginBottom: '35px' }}>
            Agente: <strong>{nome}</strong> | NEX: <strong>{nex}%</strong>
          </p>

          {/* PAINEL DA FICHA */}
          <div style={{
            backgroundColor: '#161616',
            borderRadius: '8px',
            padding: '30px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.7)',
            border: '1px solid #222'
          }}>

            {/* CONTROLE DE VIDA */}
            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
              <h3 style={{ color: '#2ecc71', margin: '0 0 10px 0' }}>PONTOS DE VIDA: {vida} / {vidaMax}</h3>
              <div>
                <button onClick={() => vida > 0 && setVida(vida - 1)} style={botaoEstilo}>-1 PV</button>
                <button onClick={() => vida < vidaMax && setVida(vida + 1)} style={botaoEstilo}>+1 PV</button>
              </div>
            </div>

            {/* CONTROLE DE PE */}
            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
              <h3 style={{ color: '#f1c40f', margin: '0 0 10px 0' }}>PONTOS DE ESFORÇO: {pe} / {peMax}</h3>
              <div>
                <button onClick={() => pe > 0 && setPe(pe - 1)} style={botaoEstilo}>-1 PE</button>
                <button onClick={() => pe < peMax && setPe(pe + 1)} style={botaoEstilo}>+1 PE</button>
              </div>
            </div>

            {/* CONTROLE DE SANIDADE */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#9b59b6', margin: '0 0 10px 0' }}>SANIDADE: {sanidade} / {sanMax}</h3>
              <div>
                <button onClick={() => sanidade > 0 && setSanidade(sanidade - 1)} style={botaoEstilo}>-1 SAN</button>
                <button onClick={() => sanidade < sanMax && setSanidade(sanidade + 1)} style={botaoEstilo}>+1 SAN</button>
              </div>
            </div>

          </div>

          {/* MODIFICADOR RÁPIDO DO AGENTE */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <input
                type="text"
                placeholder="Mudar nome do agente"
                value={nome}
                onChange={(e) => setNome(e.target.value || 'Sem Nome')}
                style={inputEstilo}
            />
            <input
                type="number"
                placeholder="NEX"
                value={nex}
                onChange={(e) => setNex(Number(e.target.value) || 0)}
                style={{ ...inputEstilo, width: '70px' }}
            />
          </div>

          {/* BOTÃO PARA SALVAR NO BACKEND */}
          <button
              onClick={salvarNoJava}
              style={{ ...botaoEstilo, backgroundColor: '#c81e1e', marginTop: '20px', padding: '12px 24px', fontSize: '1rem' }}
          >
            💾 Salvar Agente no Java
          </button>

          {/* RESPOSTA DO BACKEND */}
          {mensagemBackend && (
              <p style={{ marginTop: '15px', color: '#2ecc71', fontWeight: 'bold' }}>
                {mensagemBackend}
              </p>
          )}

          {/* AVISOS DE STATUS */}
          {vida === 0 && <p style={alertaEstilo}>⚠️ O Agente caiu enraizado ou morto!</p>}
          {sanidade === 0 && <p style={alertaEstilo}>⚠️ O Agente enlouqueceu completamente!</p>}
        </div>

        {/* 🏞️ IMAGEM DA LATERAL DIREITA */}
        <div style={{
          width: '20%',
          backgroundImage: `url('/IMAGEM_2.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderLeft: '2px solid #c81e1e',
          boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
          display: 'none' as any,
        }} className="lateral-painel" />

        <style>{`
        @media (min-width: 768px) {
          .lateral-painel { display: block !important; }
        }
      `}</style>

      </div>
  )
}

// Estilos
const botaoEstilo = {
  backgroundColor: '#2a2a2a',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  margin: '0 5px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  transition: 'background 0.2s'
}

const inputEstilo = {
  backgroundColor: '#161616',
  color: 'white',
  border: '1px solid #333',
  padding: '10px',
  borderRadius: '4px',
  outline: 'none'
}

const alertaEstilo = {
  color: '#ff3333',
  fontWeight: 'bold' as const,
  marginTop: '20px',
  backgroundColor: 'rgba(255,51,51,0.1)',
  padding: '10px 20px',
  borderRadius: '4px',
  border: '1px solid #ff3333'
}
