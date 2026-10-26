# Inimigos

Todos surgem nas bordas da arena (os caças entram pelas laterais). A vida é multiplicada por `1 + tempo/110`. O dano é multiplicado por `1 + tempo/170` e a velocidade dos projéteis cresce até +60% (veja [dificuldade](07-dificuldade-e-pontuacao.md)).

Encostar em qualquer inimigo causa 30 de dano por segundo (90 se for um chefe), também escalado pelo tempo.

## Tabela de atributos (valores base)

| Inimigo | Aparece em | Peso no sorteio | Vida | Pontos | XP | Raio |
|---|---|---|---|---|---|---|
| Soldado | 0 s | 8 | 30 | 10 | 1 | 4 |
| Tanque | 20 s | 3 | 170 | 40 | 3 | 7 |
| Caça | 40 s | 3 | 55 | 20 | 2 | 6 |
| Agente secreto | 60 s | 3 | 70 | 25 | 2 | 4 |
| Míssil guiado | 80 s | 3 | 12 | 6 | 1 | 3 |
| Maçom | 105 s | 2 | 100 | 35 | 3 | 5 |
| Disco alienígena | 135 s | 2 | 140 | 50 | 4 | 7 |

O peso define a chance relativa de cada tipo entre os já liberados.

## Comportamentos

### Soldado
Infantaria de farda verde e capacete.
- Mantém uns 85 px de distância, ondulando de lado.
- A cada 1,6 a 2,3 s dispara um tiro mirado (72 px/s, 20 de dano).
- Depois dos 25 s, chega em **esquadrões de 3**.

### Tanque
Blindado visto de cima, com torre que gira em direção ao jogador.
- Lento (14 px/s) e fica a uns 130 px.
- A cada 2,7 a 3,7 s dispara 3 obuses em leque (62 px/s, 34 de dano) e treme a tela.
- Depois dos 150 s, também lança um míssil guiado a cada 8 a 11 s.

### Caça
Jato cinza com cabine azul que cruza a tela na horizontal.
- Velocidade de 105 px/s, até 185 px/s com o tempo.
- Larga projéteis para cima e para baixo a cada 0,2 s (18 de dano), formando uma "parede".
- Some ao sair da tela.

### Agente secreto
Terno escuro, óculos pretos e gravata vermelha.
- Circula ao redor do jogador num raio de ~70 px, em sentido horário ou anti-horário.
- A cada 2,1 a 3,1 s dispara uma rajada de 3 tiros rápidos (118 px/s, 20 de dano).

### Míssil guiado
- Persegue o jogador girando até 2,4 rad/s, com velocidade de 82 a 132 px/s.
- Deixa rastro de fumaça e fogo.
- Explode ao tocar Ômega (55 de dano) ou depois de 7 s.
- Também é lançado por tanques e pela Sentinela Estelar.

### Maçom
Figura encapuzada em roxo, com olhos vermelhos e medalhão dourado.
- Fica a ~110 px de distância.
- A cada 2,8 a 3,4 s emite um **anel** de 12 a 22 projéteis (46 px/s, 22 de dano). O anel gira a cada disparo e fica mais denso com o tempo.

### Disco alienígena
Disco voador cinza com cúpula verde e piloto.
- Vaga até pontos aleatórios da arena.
- Dispara uma **espiral** contínua: 1 projétil a cada 0,11 s (55 px/s, 18 de dano).
- Emite um feixe de luz verde por baixo.

## Barra de vida

Inimigos com vida base de 60 ou mais (tanque, agente, maçom e alienígena) mostram uma barra vermelha acima deles quando feridos.
