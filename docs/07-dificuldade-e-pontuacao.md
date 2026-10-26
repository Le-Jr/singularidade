# Dificuldade e pontuação

A dificuldade depende só do **tempo de sobrevivência** (`t`, em segundos). Não há modos de dificuldade. Cada curva abaixo cresce de forma independente.

## Curvas de escala

| O que escala | Fórmula | Em 1 min | Em 3 min | Em 5 min |
|---|---|---|---|---|
| Intervalo entre surgimentos | `max(0,13; 1,1 − 0,0055·t)` s | 0,77 s | 0,13 s | 0,13 s |
| Vida dos inimigos | `× (1 + t/110)` | ×1,55 | ×2,64 | ×3,73 |
| Dano dos inimigos | `× (1 + t/170)` | ×1,35 | ×2,06 | ×2,76 |
| Velocidade dos projéteis | `× min(1,6; 1 + t/380)` | ×1,16 | ×1,47 | ×1,6 |
| Velocidade dos caças | `105 + min(80; 0,25·t)` px/s | 120 | 150 | 180 |
| Velocidade dos mísseis | `82 + min(50; 0,15·t)` px/s | 91 | 109 | 127 |
| Projéteis por anel do Maçom | `12 + min(10; ⌊t/30⌋)` | 14 | 18 | 22 |

Outros marcos:
- **25 s:** soldados passam a vir em esquadrões de 3.
- **150 s:** tanques começam a lançar mísseis.
- O surgimento atinge o piso (~7,7 inimigos/s) por volta dos **176 s**.
- Durante a luta com um chefe, o intervalo é multiplicado por 2,3.

### Por que Ômega sempre cai

O dano inimigo cresce sem teto (linear no tempo), enquanto a regeneração e a essência máxima têm teto pelas evoluções. Por volta dos 6 a 10 minutos, a densidade de projéteis e o dano de cada golpe superam qualquer build. É a parte "seu poder é ilimitado, mas sua vida acaba".

## Ascensão (níveis)

- Cada inimigo dá XP (de 1 a 4, chefes dão 40).
- XP para o próximo nível: `⌊20 × nível^1,35⌋`. São 20 XP do nível 1 para o 2, 50 do 2 para o 3, 88 do 3 para o 4 e ~447 do 10 para o 11.
- Cada nível multiplica **todo o dano de Ômega por 1,13** (composto: nível 10 dá ~3×, nível 20 dá ~10×).
- A cada 5 níveis abre uma evolução.

## Pontuação

```
pontos = pontosBase × (2 se apagado, senão 1) × (1 + t/120)
```

- Os pontos base estão na tabela de [inimigos](04-inimigos.md). Chefes valem 400 × número do chefe.
- **Apagar da existência dobra os pontos**, o que recompensa jogar perto do perigo.
- O multiplicador de tempo faz cada abate valer mais quanto mais você sobrevive (×2 aos 2 min, ×3,5 aos 5 min).

## Recorde

- Fica salvo no `localStorage` do navegador com a chave `singularidade_best`.
- Aparece no menu e na tela de fim de jogo, que mostra "Novo recorde!" quando ele é batido.
- Em janela anônima ou com os dados do site bloqueados, o recorde não persiste, mas o jogo funciona normalmente.

## Estatísticas de fim de jogo

| Campo | Significado |
|---|---|
| Tempo | Tempo sobrevivido |
| Abates | Total de inimigos destruídos (inclui apagados e chefes) |
| Apagados | Inimigos removidos com Apagar da existência |
| Heróis | Chefes derrotados |
| Ascensão | Nível final |
| Pontos | Pontuação final |
