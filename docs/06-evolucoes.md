# Evoluções (upgrades)

## Quando aparecem

- **Ao derrotar um herói**, 1,1 s depois da explosão.
- **A cada 5 níveis de Ascensão** (5, 10, 15...), 0,4 s depois de subir.

Se as duas coisas acontecerem juntas, as telas aparecem uma depois da outra (o jogo guarda uma fila).

## Como funciona

1. O jogo pausa e mostra **3 cartas sorteadas** entre as evoluções que ainda não chegaram ao nível máximo.
2. Cada carta mostra:
   - **Novo poder** (em vermelho), para um poder ainda não desbloqueado, ou **Nível X de Y**;
   - nome e descrição do efeito;
   - a tecla de atalho (1, 2 ou 3) no desktop.
3. Ao escolher, um banner confirma, toca o som de ascensão e Ômega recebe 1 s de invulnerabilidade para se situar.

Se todas as evoluções estiverem no máximo, a tela não aparece mais.

## As 11 evoluções

### Novos poderes

| Carta | Máx. | Nível 1 | Níveis seguintes |
|---|---|---|---|
| Parar o Tempo | 3 | Q congela o mundo por 3 s (recarga 16 s) | +1,5 s de duração e −2 s de recarga |
| Clones Quânticos | 4 | 1 clone que orbita e atira | +1 clone |
| Chuva de Estrelas | 4 | Estrela a cada 2,75 s (260 de dano) | Intervalo −0,65 s (mín. 0,8 s) |
| Escudo de Fase | 3 | Ignora 1 golpe a cada 8 s | −2 s de recarga (8 → 6 → 4 s) |

### Melhorias de poderes existentes

| Carta | Máx. | Efeito por nível | No máximo |
|---|---|---|---|
| Rajada Múltipla | 4 | +1 projétil por disparo | 6 projéteis |
| Raio Ampliado | 4 | Largura +0,5× e dano ×1,4 | Largura 3× e dano ~3,8× |
| Horizonte de Eventos | 4 | Alcance do Apagar ×1,2 e recarga −0,7 s | Alcance ~2,07× e recarga 2,2 s |
| Passo Quântico | 3 | Recarga do Teleporte ×0,75 e explosão +12 px | Recarga ~0,76 s e explosão 72 px |
| Aura Nuclear | 4 | Raio +6 px e dano ×1,5 | Raio 42 px e dano ~481/s |
| Corpo Eterno | 5 | +250 de essência máxima e **cura total** | 2250 de essência |
| Regeneração Cósmica | 4 | +4 de essência por segundo | 19/s |

## Builds sugeridas

- **Cronomante:** Parar o Tempo, Raio Ampliado e Horizonte de Eventos. Congela, fatia em linha e apaga o resto.
- **Exército de um:** Clones Quânticos, Rajada Múltipla e Chuva de Estrelas. Dano espalhado pela tela toda, quase sem precisar mirar.
- **Imortal:** Corpo Eterno, Regeneração Cósmica, Escudo de Fase e Aura Nuclear. Fica no meio dos inimigos e deixa a aura trabalhar.
- **Fantasma:** Passo Quântico, Escudo de Fase e Aura Nuclear. Teleporta para dentro dos grupos e explode na chegada.

## Dados técnicos

As evoluções ficam no array `UPGRADES` em `src/sim/data/upgrades.ts`. Cada entrada traz o próprio efeito (`apply`), e os níveis atuais ficam em `state.lv`. Veja [Architecture](08-architecture.md#upgrade-system).
