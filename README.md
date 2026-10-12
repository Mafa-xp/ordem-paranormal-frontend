# 👁️ Ordem Paranormal RPG — Front-end (React + TypeScript)

Interface web interativa desenvolvida em React, TypeScript e Vite para o sistema de RPG **Ordem Paranormal**. A aplicação possui tema sombrio imersivo, gerenciamento de passos (Criação de Agente, Seleção de Ameaça e Combate) e integração em tempo real com API REST.
---
## 🎥 Demonstração Visual

<video src="https://github.com/user-attachments/assets/1f12c405-e2ce-4e8a-930c-d47ea6918375" controls="controls" style="max-width: 600px;"></video>

---
<img width="800" height="381" alt="GravaodeTela2026-10-1216583311-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/ec176be5-5b94-45fa-9e00-6805efff7efe" />

---
> 🔗 **Back-end da aplicação (Spring Boot):** [ordem-paranormal-backend](https://github.com/Mafa-xp/ordem-paranormal-backend)

---

## 🛠️ Tecnologias Utilizadas

* **React 18**
* **TypeScript**
* **Vite**
* **CSS3 / Inline Styles (Design Responsivo)**

---

## 🎮 Funcionalidades

* **Fluxo Dinâmico por Etapas:**
  1. Identificação do Jogador
  2. Apresentação das Regras (Mecânica D20/D6)
  3. Escolha da Classe (Ocultista, Combatente, Especialista)
  4. Ficha do Agente
  5. Seleção da Ameaça Paranormal (Fácil, Médio, Boss)
  6. Arena de Combate com Log em Tempo Real
* **Painel de Ações de Combate:**
  * ⚔️ **Atacar:** D20 ($\ge 15$) + 1D6 + Força/Intelecto.
  * 🛡️ **Defender:** Redução de dano.
  * ✨ **Curar:** Recuperação de PV com trava na vida máxima.
  * 🔥 **Especial:** Ataque de alto impacto com cooldown de 5 turnos.
* **Recursos de Experiência do Usuário (UX):**
  * Histórico de combate transparente (ações do jogador e reações do inimigo).
  * Botão de reiniciar partida e escolher nova classe sem atualizar a página.
    
---

## 🚀 Como Executar o Projeto

```bash
# Clone o repositório
git clone [https://github.com/SEU_USUARIO/ordem-paranormal-frontend.git](https://github.com/SEU_USUARIO/ordem-paranormal-frontend.git)

# Acesse a pasta do projeto
cd ordem-paranormal-frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
