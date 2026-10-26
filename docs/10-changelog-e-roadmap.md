# Changelog e roadmap

## Changelog

### v2.0: Migração para Phaser
- Jogo reescrito em **Phaser 4 + Vite + TypeScript**, com o mesmo conteúdo e os mesmos números da v1.1.
- Simulação separada da renderização (`src/sim/`, sem Phaser), com **timestep fixo de 60 Hz** e **RNG com semente**: a mesma semente e as mesmas entradas geram a mesma partida.
- Efeitos de tela (Parar o Tempo e Apagar) agora usam filtros de câmera do WebGL.
- Arrays de projéteis e partículas compactados no lugar, sem alocar um array novo por quadro.
- Testes automatizados da simulação (`npm test`), relatório de balanceamento sem navegador (`npm run sim`) e playtest visual automatizado (`npm run playtest`).
- A versão original em arquivo único fica em `legacy/` como referência.

### v1.1: Evoluções
- Tela de evolução com 3 cartas sorteadas, aberta ao derrotar um herói e a cada 5 níveis de Ascensão.
- Fila de evoluções quando dois gatilhos acontecem juntos.
- Novos poderes: **Parar o Tempo**, **Clones Quânticos**, **Chuva de Estrelas** e **Escudo de Fase**.
- Melhorias para todos os poderes iniciais: Rajada Múltipla, Raio Ampliado, Horizonte de Eventos, Passo Quântico e Aura Nuclear. Mais Corpo Eterno e Regeneração Cósmica.
- Indicador e botão de Parar o Tempo no HUD (desktop e celular).
- Teclas 1, 2 e 3 para escolher cartas.

### v1.0: Lançamento
- Protagonista Ômega com rajadas, Raio Cósmico, Apagar da existência, Teleporte e aura de contato.
- 7 tipos de inimigo em 8 fases de ameaça.
- 4 super-heróis originais como chefes, em ciclo e com escala.
- Ascensão (XP e níveis) com bônus de dano.
- Controles para desktop e celular (joystick virtual e mira automática).
- Áudio sintetizado, recorde salvo no navegador, pausa automática.

## Roadmap (ideias)

### Conteúdo
- [ ] Novos heróis: um velocista que deixa rastros de fogo e uma telepata que controla inimigos.
- [ ] Inimigos de elite com aura colorida, mais vida e um padrão extra.
- [ ] Novas arenas que mudam a cada ciclo de chefes: cidade em ruínas, órbita, dimensão alternativa.
- [ ] Evoluções lendárias que exigem duas outras no máximo (ex.: Tempo + Raio = "Raio Eterno").

### Mecânicas
- [ ] Combo: abates seguidos aumentam um multiplicador de pontos.
- [ ] Poder supremo: barra que enche com abates e libera uma supernova que limpa a tela.
- [ ] Modos de dificuldade, ou modo "Desafio" com evoluções fixas.

### Técnico
- [x] Separar o código em módulos (feito na v2.0: `src/sim`, `src/render`, `src/input`, `src/audio`, `src/ui`).
- [x] Timestep fixo e RNG com semente (v2.0). Próximo passo: gravar entradas para replays.
- [x] Pool de objetos na renderização e compactação no lugar na simulação (v2.0).
- [ ] Ranking online (ex.: Supabase) com nome do jogador e build usada.
- [ ] PWA para instalar e jogar offline.
- [ ] Suporte a controle de videogame (Gamepad API).
