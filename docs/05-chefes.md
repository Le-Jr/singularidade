# Chefes: os super-heróis

Os heróis são personagens originais do jogo. Eles chegam em ciclo, sempre na mesma ordem. Depois do quarto, o ciclo recomeça mais forte e o banner mostra "Nv 2", "Nv 3" e assim por diante.

## Regras gerais

- **Primeiro chefe:** aos 70 s.
- **Próximos:** 55 s depois da derrota do anterior.
- **Entrada:** descem do topo da tela com banner e som grave.
- **Vida:** `base × (1 + 0,65 × chefesAnteriores) × (1 + tempo/300)`.
- **Enquanto o chefe vive:** inimigos comuns surgem 2,3 vezes mais devagar.
- **Imunes** a serem apagados (Apagar causa 700 de dano neles).
- **Dano dos projéteis:** 26 nos leques e anéis, ~21 nas espirais, escalado pelo tempo.
- **Contato:** 90 de dano por segundo.

## Recompensa

- Cura de 25% da essência máxima.
- Todos os projéteis e perigos da tela somem.
- Pontos: 400 × número do chefe (o 1º vale 400, o 2º 800...).
- **Abre a tela de evolução.**

---

## 1. Capitão Égide, o escudo da nação

Uniforme verde-petróleo com detalhes dourados e um escudo circular sempre apontado para o jogador.

| Atributo | Valor |
|---|---|
| Vida base | 3400 |
| Tamanho | 2× |

**Ataques**
- **Leque de escudo:** a cada 0,95 s, 7 projéteis em leque (86 px/s) mirados no jogador.
- **Investida:** a cada 5,2 s, avança em linha reta a 235 px/s por 0,85 s. Ao parar, solta um anel de 18 projéteis e a tela treme.

**Como vencer:** desvie para o lado na investida e use o Teleporte para sair do anel.

---

## 2. Valquíria Volt, a tempestade que pensa

Capa violeta, cabelo amarelo elétrico e faíscas constantes ao redor.

| Atributo | Valor |
|---|---|
| Vida base | 3800 |
| Tamanho | 2× |

**Ataques**
- **Espiral tripla:** 3 braços giratórios, 1 projétil por braço a cada 0,085 s (58 px/s).
- **Relâmpago:** a cada 3,3 s, uma linha amarela piscante marca a direção por 0,75 s. Depois cai um raio que cruza a tela inteira (62 de dano).

**Como vencer:** quando a linha de aviso aparecer, saia dela. O Raio Cósmico apaga a espiral.

---

## 3. Titã Carmesim, força sem limite

Gigante vermelho de olhos amarelos, 50% maior que os outros heróis.

| Atributo | Valor |
|---|---|
| Vida base | 5200 |
| Tamanho | 3× |
| Velocidade | menor que os outros heróis |

**Ataques**
- **Anel duplo:** a cada 2,3 s, dois anéis de 22 projéteis em velocidades diferentes (56 e 40 px/s), defasados entre si.
- **Onda de choque:** a cada 4,8 s, golpeia o chão e solta um anel laranja que se expande a 135 px/s (70 de dano). Só acerta se você estiver na borda do anel quando ela passar.

**Como vencer:** fique entre os dois anéis. Na onda de choque, use o Teleporte (invulnerável) ou o Escudo de Fase.

---

## 4. Sentinela Estelar, guardiã da órbita

Armadura prateada com visor ciano pulsante.

| Atributo | Valor |
|---|---|
| Vida base | 4400 |
| Tamanho | 2× |

**Ataques**
- **Espiral quádrupla:** 4 braços, 1 projétil por braço a cada 0,09 s (74 px/s).
- **Bateria de mísseis:** a cada 3,2 s, lança 3 mísseis guiados.

**Como vencer:** a aura e o Raio Cósmico destroem mísseis com facilidade. Parar o Tempo abre uma janela segura para causar dano.
