# Visão geral

## Conceito

**Singularidade** é um bullet hell de sobrevivência com o jogador em "god mode". Ao contrário do gênero clássico, em que a nave é frágil, aqui o protagonista é absurdamente poderoso: ataques infinitos, vida alta, regeneração e poderes capazes de apagar inimigos da existência. A tensão vem do volume. A quantidade de inimigos, de projéteis e o dano de cada golpe crescem sem parar até superar até mesmo um deus.

**Gênero:** bullet hell / arena survival (parecido com twin-stick shooters e "survivor-likes").
**Plataforma:** navegador, no desktop e no celular.
**Duração de uma partida:** de 3 a 15 minutos, dependendo da habilidade e da build.

## História

Zona de Teste 7, 03:14 da manhã. Um reator experimental falha com um pesquisador dentro. O corpo dele se desfaz e se reconstrói como **Ômega**, uma consciência que percebe a matéria em todas as escalas e a manipula à vontade.

O governo reage com tudo o que tem. Primeiro o exército, depois blindados, a força aérea, o serviço secreto e mísseis guiados. Quando nada disso funciona, entram em cena forças que ninguém sabia que existiam: sociedades secretas, alienígenas observando a Terra e, por fim, os maiores super-heróis do mundo.

## Protagonista: Ômega

- Figura humanoide dourada e luminosa, com olhos brancos, flutuando sobre a arena.
- Cercado por um brilho radial, um anel de aura pulsante e quatro partículas em órbita.
- Personagem original, inspirado no arquétipo do "ser pós-humano onipotente".

| Atributo | Valor inicial |
|---|---|
| Essência (vida) | 1000 |
| Regeneração | 3 por segundo |
| Velocidade | 115 px/s (55% disso enquanto usa o Raio Cósmico) |
| Hitbox | ~2,5 px de raio (pequena, como manda o gênero) |

## Loop de jogo

1. **Sobreviver.** Inimigos surgem das bordas da arena, cada vez mais rápido.
2. **Destruir.** Cada abate dá pontos e XP (Ascensão).
3. **Ascender.** A cada nível o dano sobe 13%. A cada 5 níveis você escolhe uma evolução.
4. **Enfrentar heróis.** Um chefe chega aos 70 s e depois a cada ~55 s após a derrota do anterior. Vencer cura 25% da essência e libera uma evolução.
5. **Cair.** O dano inimigo cresce sem limite. A partida acaba quando a essência chega a zero, e o objetivo é bater o recorde.

## Fases de ameaça

O banner "Nova ameaça" anuncia cada mudança. O nome atual aparece no canto inferior esquerdo.

| Tempo | Ameaça | Novidade |
|---|---|---|
| 0 s | Exército | Soldados |
| 20 s | Blindados | Tanques |
| 40 s | Força Aérea | Caças |
| 60 s | Serviço Secreto | Agentes |
| 80 s | Mísseis guiados | Mísseis teleguiados |
| 105 s | Maçons | Maçons (anéis de projéteis) |
| 135 s | Invasão alienígena | Discos alienígenas |
| 220 s | Tudo ao mesmo tempo | Sem novos tipos, só escala |

## Telas

- **Menu:** título, história curta, controles (desktop ou celular, detectado automaticamente) e recorde.
- **Jogo:** canvas com HUD sobreposto.
- **Evolução:** pausa o jogo e mostra 3 cartas de upgrade.
- **Pausa:** tecla P ou Esc, e automática quando a janela perde o foco.
- **Fim de jogo:** tempo, abates, apagados, heróis derrotados, ascensão e pontos.

## HUD

Inspirado em Vampire Survivors e 20 Minutes Till Dawn.

| Posição | Elemento |
|---|---|
| Faixa no topo | Barra de XP de ponta a ponta, com o nível de Ascensão à direita |
| Superior esquerdo | Coração e barra de Essência (vida); abaixo, o inventário: poderes na primeira fileira (Raio, Apagar, Teleporte, Tempo, Clones, Estrelas, Fase) e passivas na segunda (Rajada, Aura, Corpo, Regeneração), com o nível de evolução no canto de cada ícone e borda dourada no nível máximo |
| Topo central | Cronômetro, ameaça atual e, durante a luta, nome e vida do chefe |
| Superior direito | Abates (caveira) e pontos (estrela) |
| Inferior central | Barra de poderes ativos com tecla e recarga circular (desktop) |
| Inferior direito (celular) | Botões de toque com os mesmos ícones e recarga circular, em grade 2 × 2 |
| Sob Ômega | Barrinha de vida que acompanha o personagem |

A tela de evolução mostra as 3 cartas em lista, cada uma com ícone, nome, nível ("Novo!" para poderes inéditos), descrição e tecla, e embaixo o inventário atual.
