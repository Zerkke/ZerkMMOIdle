# ⚔️ Zerk Idle MMORPG

O **Zerk Idle MMORPG** é um jogo de RPG em navegador focado em progressão *idle*, combate automatizado, desenvolvimento de proficiências (*lifeskills*), gestão de essências e evolução de talentos.

Este projeto foi construído do zero com foco em **Clean Architecture**, **Domain-Driven Design (DDD)** e **Arquitetura Orientada a Eventos**, garantindo alta escalabilidade, facilidade de manutenção e testes isolados.

---

## 🛠️ Tecnologias e Ferramentas

* **Linguagem / Runtime:** TypeScript / JavaScript (Node.js)
* **Backend & Autenticação:** Supabase (PostgreSQL / Persistência e Nuvem)
* **Arquitetura:** Clean Architecture / Domain-Driven Design (DDD)
* **Comunicação Interna:** Barramento de Eventos Tipado (*Typed Event Bus*)

---

## 🧠 Arquitetura do Sistema

O projeto está dividido em camadas bem definidas para manter o código limpo e desacoplado:

```text
zerk-idle-mmorpg/
├── src/
│   ├── core/         # Contratos de relógio, Event Bus e utilitários centrais
│   ├── config/       # Configurações globais e balanceamento
│   ├── data/         # Repositórios e integração com Supabase
│   ├── domain/       # Lógica de negócio pura (Regras do Jogo)
│   │   ├── combat/   # Sistema e simulação de combate
│   │   ├── essence/  # Sistema de essências e melhoramentos
│   │   ├── skills/   # Proficiências e recolha de recursos
│   │   ├── idle/     # Simulação matemática de progresso offline
│   │   └── ...
│   └── auth/         # Gestão de sessões e contas
```

### Principais Decisões de Design:

1. **Isolamento do Domínio (`/domain`):** As regras do jogo (fórmulas de dano, ganhos de experiência, taxas de recolha) são totalmente independentes da interface e da base de dados.
2. **Barramento de Eventos Tipado (`/core`):** Permite que ações no jogo (como `enemy_killed` ou `level_up`) notifiquem outros módulos de forma desacoplada.
3. **Simulação Offline (*Idle*) Eficiente:** O cálculo do tempo esteve offline é feito de forma matemática e analítica (aplicando taxas por minuto/hora), garantindo cálculos instantâneos e sem perda de performance no login.

---

## 🚀 Funcionalidades Atuais

- [x] Autenticação e sincronização de progresso na nuvem via Supabase.
- [x] Motor de combate com ciclo de loops e recompensas.
- [x] Sistema de proficiências e recolha automatizada.
- [x] Melhoramento de equipamento e gestão de essências.
- [x] Algoritmo de cálculo de progresso offline (*idle*).
- [ ] *[Em Desenvolvimento]* Interface gráfica completa e novos mapas.

---

## 💻 Como Executar Localmente

### Pré-requisitos
* Node.js (v18 ou superior)
* npm ou yarn

### Passos:
1. Clona o repositório:
   ```bash
   git clone https://github.com/teu-usuario/zerk-idle-mmorpg.git
   ```
2. Entra na pasta do projeto:
   ```bash
   cd zerk-idle-mmorpg
   ```
3. Instala as dependências:
   ```bash
   npm install
   ```
4. Configura as variáveis de ambiente (cria um ficheiro `.env` com as tuas chaves do Supabase):
   ```env
   SUPABASE_URL=sua_url_aqui
   SUPABASE_ANON_KEY=sua_chave_aqui
   ```
5. Inicia o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Autor

Desenvolvido por **Mr ZerkkJ**.

* **LinkedIn:** [[O teu link do LinkedIn](https://www.linkedin.com/feed/)]
* **GitHub:** [(https://github.com/Zerkke)]

*Se gostaste do projeto ou queres contribuir/deixar feedback, fica à vontade para abrir uma Issue ou Pull Request!*
