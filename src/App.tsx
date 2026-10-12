import { useState } from 'react'

interface FichaPersonagem {
  classe: string
  vida: number
  vidaMax: number
  forca: number
  nomePersonagem?: string
}

interface InimigoData {
  nome: string
  vida: number
  vidaMax: number
}

export default function App() {
  const [nomeJogador, setNomeJogador] = useState('')
  const [nomePersonagem, setNomePersonagem] = useState('')
  const [etapa, setEtapa] = useState(1) // 1: Nome | 2: Regras | 3: Classe | 4: Ficha | 5: Inimigo | 6: Batalha
  const [mensagemBackend, setMensagemBackend] = useState('')
  const [ficha, setFicha] = useState<FichaPersonagem | null>(null)
  const [inimigo, setInimigo] = useState<InimigoData | null>(null)
  const [logCombate, setLogCombate] = useState<string[]>([])
  const [recargaEspecial, setRecargaEspecial] = useState(0)

  // 1. Salvar Nome do Jogador
  const salvarJogador = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeJogador.trim()) return

    try {
      const resposta = await fetch('http://localhost:8081/api/jogo/jogador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ nome: nomeJogador }),
      })

      if (!resposta.ok) throw new Error('Erro no servidor')

      const dados = await resposta.json()
      setMensagemBackend(dados.mensagem || 'Jogador registrado com sucesso!')
      setEtapa(2)
    } catch (erro) {
      console.error('Erro:', erro)
      alert('Erro ao conectar com o Java na porta 8081.')
    }
  }

  // 2. Escolher Classe
  const escolherClasse = async (opcao: number) => {
    try {
      const resposta = await fetch('http://localhost:8081/api/jogo/classe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ opcao }),
      })

      if (!resposta.ok) throw new Error('Erro ao escolher classe')

      const dados = await resposta.json()
      setFicha({
        classe: dados.classe,
        vida: dados.vidaMax,
        vidaMax: dados.vidaMax,
        forca: dados.forca
      })
      setMensagemBackend(`Classe ${dados.classe} selecionada com sucesso!`)
      setEtapa(4)
    } catch (erro) {
      console.error('Erro:', erro)
      alert('Erro ao enviar classe para o Java.')
    }
  }

  // 3. Salvar Nome do Personagem
  const salvarNomePersonagem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomePersonagem.trim()) return

    try {
      const resposta = await fetch('http://localhost:8081/api/jogo/personagem/nome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ nome: nomePersonagem }),
      })

      if (!resposta.ok) throw new Error('Erro ao definir nome')

      const dados = await resposta.json()
      if (ficha) {
        setFicha({ ...ficha, nomePersonagem: dados.nomePersonagem })
      }
      setMensagemBackend(`Agente ${dados.nomePersonagem} pronto para a missão!`)
    } catch (erro) {
      console.error('Erro:', erro)
      alert('Erro ao enviar nome do personagem para o Java.')
    }
  }

  // 4. Escolher Inimigo e Iniciar Batalha
  const escolherInimigo = async (nivel: number) => {
    try {
      const resposta = await fetch('http://localhost:8081/api/jogo/inimigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ nivel }),
      })

      if (!resposta.ok) throw new Error('Erro ao escolher inimigo')

      const dados = await resposta.json()

      const nomesInimigo = ['Zumbi de Sangue', 'Existência Assustadora', 'Criatura de Morte']
      const nomeInimigo = nomesInimigo[nivel - 1] || 'Ameaça Paranormal'

      setInimigo({
        nome: nomeInimigo,
        vida: dados.vidaInimigo,
        vidaMax: dados.vidaInimigo
      })

      setMensagemBackend('Ameaça detectada! Prepare-se para o combate.')
      setLogCombate(['O combate começou! Escolha a sua ação.'])
      setRecargaEspecial(0)
      setEtapa(6)
    } catch (erro) {
      console.error('Erro:', erro)
      alert('Erro ao selecionar inimigo no Java.')
    }
  }

  // 5. Executar Ação de Combate
  // Executar Ação de Combate
  const executarAcaoCombate = async (acao: 'atacar' | 'defender' | 'curar' | 'especial') => {
    if (!ficha || !inimigo || inimigo.vida <= 0 || ficha.vida <= 0) return

    if (acao === 'especial' && recargaEspecial > 0) {
      alert(`Ataque Especial em recarga! Aguarde mais ${recargaEspecial} turno(s).`)
      return
    }

    try {
      const resposta = await fetch('http://localhost:8081/api/jogo/acao-batalha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ acao }),
      })

      if (!resposta.ok) throw new Error('Erro ao executar ação de combate')

      const dados = await resposta.json()

      // Atualiza os status de vida
      setFicha({ ...ficha, vida: dados.vidaJogador })
      setInimigo({ ...inimigo, vida: dados.vidaInimigo })

      // Adiciona no Log de Combate (Inimigo e Jogador)
      const novasLogs: any[] = []
      if (dados.logInimigo) novasLogs.push(dados.logInimigo)
      if (dados.logJogador) novasLogs.push(dados.logJogador)

      setLogCombate((logsAntigos) => [...novasLogs, ...logsAntigos])

      // Atualiza o tempo de recarga do especial do jogador
      if (acao === 'especial') {
        setRecargaEspecial(5)
      } else if (recargaEspecial > 0) {
        setRecargaEspecial(recargaEspecial - 1)
      }
    } catch (erro) {
      console.error('Erro:', erro)
      alert('Erro ao processar turno no Java.')
    }
  }

  // Função para reiniciar e voltar para a escolha de classe
  const reiniciarPartida = async () => {
    try {
      await fetch('http://localhost:8081/api/jogo/reiniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      })

      // Reseta os estados locais do React
      setFicha(null)
      setInimigo(null)
      setLogCombate([])
      setRecargaEspecial(0)
      setEtapa(3) // Volta direto para a Etapa de Escolha de Classe!
    } catch (erro) {
      console.error('Erro ao reiniciar:', erro)
      alert('Erro ao conectar com o servidor para reiniciar.')
    }
  }

  // Função para reiniciar e voltar para a escolha de classe
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
          display: 'none',
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
          <h1
              className="estilo-paranormal"
              style={{ color: '#c81e1e', margin: '0 0 5px 0', fontSize: '3.5rem', textAlign: 'center' }}
          >
            SISTEMA DE ORDEM PARANORMAL
          </h1>

          <p style={{ color: '#aaa', fontStyle: 'italic', marginBottom: '35px' }}>
            SISTEMA DE INTERAÇÃO E COMBATE
          </p>

          {/* 📋 PAINEL INTERATIVO */}
          <div style={{
            backgroundColor: '#161616',
            borderRadius: '12px',
            padding: '35px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.8)',
            border: '1px solid #222'
          }}>

            {/* ETAPA 1: NOME DO JOGADOR */}
            {etapa === 1 && (
                <form onSubmit={salvarJogador} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      Qual é o seu nome, Agente?
                    </label>
                    <input
                        type="text"
                        placeholder="Digite o seu nome..."
                        value={nomeJogador}
                        onChange={(e) => setNomeJogador(e.target.value)}
                        style={inputEstilo}
                        required
                    />
                  </div>

                  <button type="submit" style={botaoRedStyle}>
                    Iniciar Investigação
                  </button>
                </form>
            )}

            {/* ETAPA 2: REGRAS DO JOGO COM REGRAS DO D20 E D6 */}
            {etapa === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                  <div style={mensagemSucessoEstilo}>
                    {mensagemBackend}
                  </div>

                  <div>
                    <h3 style={{ color: '#c81e1e', margin: '0 0 10px 0', fontSize: '1.2rem' }}>Protocolo de Regras</h3>
                    <ul style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: '1.6', paddingLeft: '18px', margin: 0 }}>
                      <li><strong>Teste de Ação (1D20):</strong> Para acertar qualquer ação (Atacar, Curar ou Defender), você precisa tirar <strong>15 ou mais</strong> no D20.</li>
                      <li><strong>Intensidade (1D6):</strong> Se passar no teste, um D6 é rolado para calcular o valor base de Dano, Cura ou Escudo.</li>
                      <li><strong>Dano Final:</strong> É calculado somando o resultado do D6 + a Força da sua Classe.</li>
                      <li><strong>Ataque Especial:</strong> Causa dano massivo devastador, mas possui uma recarga de 5 turnos.</li>
                      <li><strong>Troca de Nome:</strong> O nome do personagem só pode ser alterado uma única vez.</li>
                      <li>Cada classe (Ocultista, Combatente e Especialista) possui diferenciais únicos.</li>
                      <li><strong>OCULTISTA:</strong> possui mais vida, mas menor força física inicial.</li>
                      <li><strong>COMBATENTE:</strong> possui mais força, mas menor vida inicial.</li>
                      <li><strong>ESPECIALISTA:</strong> possui uma facilidade de tirar dados maiores.</li>
                      <li><strong>Sobreviva aos horrores e vença o inimigo para concluir a missão.</strong></li>

                    </ul>
                  </div>

                  <button onClick={() => setEtapa(3)} style={botaoCinzaEstilo}>
                    Avançar para Escolha de Classe ➔
                  </button>
                </div>
            )}

            {/* ETAPA 3: ESCOLHA DA CLASSE */}
            {etapa === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
                  <h3 style={{ color: '#c81e1e', margin: '0 0 5px 0', fontSize: '1.3rem' }}>Selecione a sua Classe</h3>
                  <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '15px' }}>
                    Cada classe define a sua Vida Inicial e Força em combate.
                  </p>

                  <div onClick={() => escolherClasse(1)} style={cardClasseEstilo}>
                    <div style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: '1.1rem' }}>🔮 OCULTISTA</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
                      PV Max: <span style={{ color: '#2ecc71' }}>20</span> | Força: <span style={{ color: '#e74c3c' }}>2</span>
                    </div>
                  </div>

                  <div onClick={() => escolherClasse(2)} style={cardClasseEstilo}>
                    <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.1rem' }}>⚔️ COMBATENTE</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
                      PV Max: <span style={{ color: '#2ecc71' }}>15</span> | Força: <span style={{ color: '#e74c3c' }}>4</span>
                    </div>
                  </div>

                  <div onClick={() => escolherClasse(3)} style={cardClasseEstilo}>
                    <div style={{ color: '#f1c40f', fontWeight: 'bold', fontSize: '1.1rem' }}>🎯 ESPECIALISTA</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
                      PV Max: <span style={{ color: '#2ecc71' }}>18</span> | Força: <span style={{ color: '#e74c3c' }}>3</span>
                    </div>
                  </div>
                </div>
            )}

            {/* ETAPA 4: FICHA */}
            {etapa === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={mensagemSucessoEstilo}>
                    {mensagemBackend}
                  </div>

                  {!ficha?.nomePersonagem ? (
                      <form onSubmit={salvarNomePersonagem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <label style={{ color: '#ccc', fontWeight: 'bold', fontSize: '0.95rem' }}>
                          Qual é o nome do seu Personagem?
                        </label>
                        <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>
                          ⚠️ Atenção: Você só pode definir o nome do personagem uma vez!
                        </p>
                        <input
                            type="text"
                            placeholder="Ex: Thiago Fritz..."
                            value={nomePersonagem}
                            onChange={(e) => setNomePersonagem(e.target.value)}
                            style={inputEstilo}
                            required
                        />
                        <button type="submit" style={botaoRedStyle}>
                          Confirmar Ficha do Agente
                        </button>
                      </form>
                  ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                        <h3 style={{ color: '#c81e1e', margin: '0', fontSize: '1.3rem', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                          📄 FICHA DO AGENTE
                        </h3>

                        <div style={{ color: '#eee', fontSize: '0.95rem', lineHeight: '1.8' }}>
                          <p style={{ margin: 0 }}><strong>Nome do Agente:</strong> {ficha.nomePersonagem}</p>
                          <p style={{ margin: 0 }}><strong>Classe:</strong> {ficha.classe}</p>
                          <p style={{ margin: 0 }}><strong>Pontos de Vida:</strong> {ficha.vidaMax} / {ficha.vidaMax}</p>
                          <p style={{ margin: 0 }}><strong>Força Física:</strong> {ficha.forca}</p>
                        </div>

                        <button
                            onClick={() => setEtapa(5)}
                            style={{ ...botaoCinzaEstilo, marginTop: '10px' }}
                        >
                          Avançar para Escolha do Inimigo ➔
                        </button>
                      </div>
                  )}
                </div>
            )}

            {/* ETAPA 5: SELEÇÃO DE INIMIGO */}
            {etapa === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
                  <h3 style={{ color: '#c81e1e', margin: '0 0 5px 0', fontSize: '1.3rem' }}>Selecione a Ameaça Paranormal</h3>
                  <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '15px' }}>
                    Escolha o nível do inimigo para iniciar o confronto.
                  </p>

                  <div onClick={() => escolherInimigo(1)} style={cardClasseEstilo}>
                    <div style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '1.1rem' }}>🟢 NÍVEL FÁCIL</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
                      Zumbi de Sangue
                    </div>
                  </div>

                  <div onClick={() => escolherInimigo(2)} style={cardClasseEstilo}>
                    <div style={{ color: '#f1c40f', fontWeight: 'bold', fontSize: '1.1rem' }}>🟡 NÍVEL MÉDIO</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
                      Existência
                    </div>
                  </div>

                  <div onClick={() => escolherInimigo(3)} style={cardClasseEstilo}>
                    <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.1rem' }}>🔴 NÍVEL BOSS</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
                      Criatura de Morte
                    </div>
                  </div>
                </div>
            )}

            {/* ETAPA 6: BATALHA COM AS 4 AÇÕES */}
            {etapa === 6 && ficha && inimigo && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
                  <h3 style={{ color: '#c81e1e', margin: '0', fontSize: '1.4rem' }}>⚔️ COMBATE PARANORMAL</h3>

                  {/* Status do Agente vs Inimigo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '0.9rem' }}>{ficha.nomePersonagem}</div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '2px' }}>
                        PV: <strong style={{ color: ficha.vida > 0 ? '#2ecc71' : '#e74c3c' }}>{ficha.vida}</strong> / {ficha.vidaMax}
                      </div>
                    </div>

                    <div style={{ color: '#c81e1e', fontWeight: 'bold', fontSize: '1.2rem', alignSelf: 'center' }}>VS</div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '0.9rem' }}>{inimigo.nome}</div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '2px' }}>
                        PV: <strong style={{ color: inimigo.vida > 0 ? '#e74c3c' : '#888' }}>{inimigo.vida}</strong> / {inimigo.vidaMax}
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação de Combate ou Tela de Fim de Jogo */}
                  {ficha.vida > 0 && inimigo.vida > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button onClick={() => executarAcaoCombate('atacar')} style={botaoRedStyle}>
                          ⚔️ Atacar
                        </button>
                        <button onClick={() => executarAcaoCombate('defender')} style={botaoCinzaEstilo}>
                          🛡️ Defender
                        </button>
                        <button onClick={() => executarAcaoCombate('curar')} style={{ ...botaoCinzaEstilo, backgroundColor: '#27ae60', borderColor: '#2ecc71' }}>
                          ✨ Curar
                        </button>
                        <button
                            onClick={() => executarAcaoCombate('especial')}
                            style={{
                              ...botaoCinzaEstilo,
                              backgroundColor: recargaEspecial === 0 ? '#8e44ad' : '#333',
                              borderColor: recargaEspecial === 0 ? '#9b59b6' : '#444',
                              cursor: recargaEspecial === 0 ? 'pointer' : 'not-allowed',
                              opacity: recargaEspecial === 0 ? 1 : 0.6
                            }}
                        >
                          🔥 Especial {recargaEspecial > 0 ? `(${recargaEspecial})` : ''}
                        </button>
                      </div>
                  ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ padding: '12px', backgroundColor: inimigo.vida <= 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)', border: `1px solid ${inimigo.vida <= 0 ? '#2ecc71' : '#e74c3c'}`, borderRadius: '6px' }}>
                          <h4 style={{ margin: 0, color: inimigo.vida <= 0 ? '#2ecc71' : '#e74c3c', fontSize: '1.1rem' }}>
                            {inimigo.vida <= 0 ? '🎉 Vitória! A ameaça foi eliminada!' : '☠️ Derrota! O agente caiu em combate.'}
                          </h4>
                        </div>

                        {/* BOTÃO PARA ESCOLHER OUTRO PERSONAGEM / CLASSE */}
                        <button onClick={reiniciarPartida} style={botaoRedStyle}>
                          Jogar Novamente
                        </button>
                      </div>
                  )}

                  {/* Histórico / Log do Combate */}
                  <div style={{ textAlign: 'left', backgroundColor: '#0a0a0a', border: '1px solid #222', padding: '12px', borderRadius: '6px', maxHeight: '130px', overflowY: 'auto' }}>
                    <span style={{ color: '#666', fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>LOG DE COMBATE</span>
                    {logCombate.map((log, index) => (
                        <p key={index} style={{ margin: '4px 0', fontSize: '0.8rem', color: index === 0 ? '#eee' : '#777' }}>
                          {log}
                        </p>
                    ))}
                  </div>

                </div>
            )}
          </div>

        </div>

        {/* 🏞️ IMAGEM DA LATERAL DIREITA */}
        <div style={{
          width: '20%',
          backgroundImage: `url('/IMAGEM_2.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderLeft: '2px solid #c81e1e',
          boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
          display: 'none',
        }} className="lateral-painel" />

        <style>{`
        @media (min-width: 768px) {
          .lateral-painel { display: block !important; }
        }
      `}</style>

      </div>
  )
}

// Estilos Reutilizáveis
const inputEstilo = {
  width: '100%',
  backgroundColor: '#0a0a0a',
  color: 'white',
  border: '1px solid #333',
  padding: '12px 15px',
  borderRadius: '6px',
  outline: 'none',
  fontSize: '1rem',
  boxSizing: 'border-box' as const
}

const botaoRedStyle = {
  backgroundColor: '#c81e1e',
  color: 'white',
  border: 'none',
  padding: '12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  fontSize: '0.95rem',
  transition: 'background 0.2s',
  boxShadow: '0 4px 12px rgba(200, 30, 30, 0.4)'
}

const botaoCinzaEstilo = {
  backgroundColor: '#2a2a2a',
  color: 'white',
  border: '1px solid #444',
  padding: '12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  fontSize: '0.95rem',
  transition: 'background 0.2s'
}

const mensagemSucessoEstilo = {
  backgroundColor: 'rgba(46, 204, 113, 0.1)',
  border: '1px solid #2ecc71',
  color: '#2ecc71',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const
}

const cardClasseEstilo = {
  backgroundColor: '#0a0a0a',
  border: '1px solid #333',
  borderRadius: '8px',
  padding: '16px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
}