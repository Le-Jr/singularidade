# Arte e áudio

## Direção visual

**Pixel art moderna (32 bits):** sprites de baixa resolução combinados com efeitos que consoles antigos não tinham, como brilho aditivo, gradientes radiais, partículas às centenas, tremor de tela e inversão de cores. A referência é o "modern pixel graphics" dos indies atuais, não a limitação literal de um console.

- **Resolução interna:** 400 × 225, ampliada sem suavização.
- **Atmosfera:** madrugada numa zona de testes militar arrasada. Chão escuro arroxeado, crateras, rachaduras, grade de testes e faixas de alerta.
- **Contraste de leitura:** Ômega é a coisa mais clara e quente da tela, em dourado e branco. Os projéteis inimigos têm cores saturadas por facção, e o chão é escuro e dessaturado. Assim o jogador sempre se acha no caos.

## Paleta

### Interface

| Token | Cor | Uso |
|---|---|---|
| `--void` | `#0c0a12` | Fundo da página |
| `--ink` | `#f1e8d4` | Texto principal |
| `--dim` | `#8a7fa0` | Texto secundário |
| `--gold` | `#ffd25e` | Ômega, destaques, botões |
| `--ember` | `#ff5a3c` | Perigo, chefes, "Novo poder" |
| `--violet` | `#9b7bff` | XP, nível das cartas |

### Facções (projéteis)

| Facção | Cor do projétil |
|---|---|
| Soldados | laranja `#ff7a3c` |
| Tanques | âmbar `#ffb23e` |
| Caças | vermelho `#ff5a3c` |
| Agentes | carmim `#ff3b5c` |
| Maçons | rosa-rubi `#ff4a6a` |
| Alienígenas | verde-menta `#9dffbf` |
| Égide | ciano-esverdeado `#7ff0e0` |
| Valquíria | lavanda `#d9c6ff` |
| Titã | laranja `#ff8a3c` e amarelo `#ffde59` |
| Sentinela | ciano `#6bf3ff` |

## Tipografia

- **Pixelify Sans** (títulos, números grandes): pixelada, mas com curvas modernas.
- **Silkscreen** (rótulos, HUD, botões): bitmap clássica, sempre em maiúsculas com espaçamento entre letras.
- Fallback: `ui-monospace, Menlo, monospace`.

## Ícones do HUD

Ícones 8 × 8 em `ICON_ART` (`src/render/art.ts`), um por evolução (raio, apagar, teleporte, ampulheta, clones, estrela cadente, escudo, rajadas, aura, coração dourado, cruz verde) mais coração vermelho (vida), caveira (abates) e estrela (pontos). Viram imagens no DOM via `src/ui/icons.ts`, ampliadas sem suavização.

## Sprites

| Sprite | Tamanho | Descrição |
|---|---|---|
| Ômega | 12 × 16 | Humanoide dourado, olhos brancos, núcleo claro no peito |
| Soldado | 8 × 10 | Capacete e farda verdes, botas pretas |
| Agente | 8 × 10 | Cabelo preto, óculos escuros, terno, gravata vermelha |
| Maçom | 8 × 11 | Capuz roxo, olhos vermelhos, medalhão dourado |
| Tanque | 16 × 11 | Visto de cima, com torre desenhada à parte |
| Caça | 16 × 9 | Asas em delta, cabine ciano, espelhado conforme a direção |
| Disco alienígena | 14 × 8 | Cúpula verde com piloto, luzes na base |
| Herói (molde) | 16 × 16 | Capa, cinto, botas. Desenhado em 2× ou 3× e recolorido por chefe |

Cada sprite tem uma versão de silhueta branca que pisca por 60 ms ao levar dano.

## Efeitos

| Efeito | Onde |
|---|---|
| Brilho radial pulsante | Ômega, clones, chefes |
| Anel de aura e partículas em órbita | Ômega |
| Raio em 3 camadas (halo, corpo, núcleo branco) | Raio Cósmico |
| Explosões de partículas por facção | Mortes |
| Poeira branca que sobe | Inimigos apagados |
| Inversão de cores da tela | Apagar da existência |
| Rastro fantasma | Teleporte |
| Mundo cinza azulado | Parar o Tempo |
| Linha piscante e relâmpago serrilhado | Valquíria Volt |
| Anel laranja expandindo | Titã Carmesim |
| Vinheta escura nas bordas | Sempre |
| Tela avermelhada | Ômega ferido |

## Áudio

Todos os sons são sintetizados em tempo real, sem arquivos.

| Som | Construção |
|---|---|
| Rajada | Onda quadrada curta, 880 → 520 Hz |
| Raio Cósmico | Zumbido contínuo (dente de serra 82 Hz + quadrada 164 Hz, filtrados) |
| Explosão | Ruído com filtro passa-baixa |
| Explosão grande | Ruído longo + queda grave 120 → 35 Hz |
| Apagar | Dente de serra caindo 1800 → 50 Hz + ruído agudo |
| Teleporte | Triângulo subindo 260 → 1500 Hz |
| Ascensão / evolução | Dois tons ascendentes |
| Chegada de chefe | Dois dentes de serra graves levemente desafinados |
| Relâmpago | Ruído agudo + quadrada descendo |
| Dano em Ômega | Quadrada grave curta |

Sons repetidos têm limite de frequência para não saturar quando muitos inimigos morrem juntos.
