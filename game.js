class Game {
    #body = document.body;
    #size;
    #game;
    #board;
    #movesName = [
        "ArrowUp",
        "ArrowRight",
        "ArrowDown",
        "ArrowLeft"
    ]
    #impossibleMove = {
        ArrowUp: "ArrowDown",
        ArrowRight: "ArrowLeft",
        ArrowDown: "ArrowUp",
        ArrowLeft: "ArrowRight"
    }
    #playerMovement = this.#randomizeMovement();
    #toRender = false;

    constructor (size) {
        this.#size = size;
        this.#load();
    }

    #load() {
        document.title = 0;

        this.#game = document.createElement("div");
        this.#game.id = "game";

        this.#loadBoard(this.#game);
        this.#addListeners();

        this.#body.appendChild(this.#game);

        this.#render();
    }

    #addListeners() {
        window.onkeydown = e => this.#changeMovement(e.key);
    }

    #changeMovement(key) {
        

        const actualMove = this.#playerMovement;
        
        if (this.#impossibleMove[actualMove] == key || this.#toRender) return;

        if (this.#movesName.includes(key)) this.#playerMovement = key;
        this.#toRender = true;
    }

    #move(key) {
        this.#board.movePlayer(key);
    }

    #loadBoard() {
        this.#board = new Board(this.#size, this.#game);
    }

    #randomizeMovement() {
        return this.#movesName[Math.floor(Math.random() * 4)]
    }

    #render() {
        setInterval(() => {
            this.#move(this.#playerMovement);
            this.#toRender = false;
        }, 80)
    }
}

class Board {
    #snakeLength = 0;
    #game;
    #playerPos;
    #board = [];
    #snake = [];
    #size;

    #moves = {
        ArrowUp: [-1, 0],
        ArrowRight: [0, 1],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1]
    }
    #moveQueue = []

    constructor(size, game) {
        this.#size = size;
        this.#game = game;

        this.#loadLines();

        this.#snake.push(this.#playerInitialPos());

        this.#updateSize();
        this.#generateApple();
    }

    #updateSize() {
        this.#snakeLength += 1;
    }

    #handleQueue(move) {
        let lastMove;
        this.#moveQueue.map((value, i) => {
            const newMove = lastMove || move;

            lastMove = this.#moveQueue[i];
            this.#moveQueue[i] = newMove;

        })
    }

    movePlayer(key) {
        const move = this.#moves[key];

        if (this.#moveQueue.length == 0) {
            this.#moveQueue.push(move);
        }

        this.#handleQueue(move);

        this.#snake.map((coord, i) => {
            this.#moveSquare(i, coord, this.#moveQueue[i]);
        })
    }

    #moveSquare(i, coords, move) {
        const square = this.#getSquareByCord(coords);
        this.#transformSquare(square, 0);
        
        this.#snake[i][0] += move[0];
        this.#snake[i][1] += move[1];

        this.#snake[i] = this.#snake[i].map(coord => {
            if (coord >= this.#size) {
                coord = 0;
            }
            if (coord < 0) {
                coord = this.#size - 1; 
            }
            return coord;
        });
        
        const newPlayerSquare = this.#getSquareByCord(this.#snake[i]);

        // Bateu em si mesmo
        if (newPlayerSquare.type == 1) {
            window.location.reload();
        }
        
        // Pegou maçã
        if (newPlayerSquare.type == 2) {
            document.title++;
            this.#increaseSnake();
            this.#generateApple();
        }

        this.#transformSquare(newPlayerSquare, 1);
    }

    #increaseSnake() {
        const lastOne = this.#snakeLength - 1;
        const queue = this.#moveQueue;
        const snake = this.#snake;
        const sub = (i) => lastOne == 0 ? queue[lastOne][i] : 0;
        const pos = [0, 1].map(i => 
            snake[lastOne][i] - sub(i))
        
        console.log("Cobra: ",snake);

        snake.push((
            pos
        ));

        queue.push(
            queue[lastOne]
        );

        console.log("Fila: ",queue);

        this.#updateSize();
    }

    #randomCoord() {
        const randomNumber = () => Math.floor(Math.random() * (this.#size - 1));
        return [
            randomNumber(),
            randomNumber()
        ];
    }

    #generateApple() {
        const coord = this.#randomCoord();
        if (coord == this.#snake[0]) this.#generateApple();

        const appleSquare = this.#getSquareByCord(coord);
        this.#transformSquare(appleSquare, 2);
    }

    #getSquareByCord(pos) {
        const x = pos[0]
        const y = pos[1]
        return this.#board[x].squares[y];
    }

    #playerInitialPos() {
        const size = this.#size;

        const coord = Math.floor((size - 1) / 2);
        const playerPos = [coord, coord];
        this.#playerPos = playerPos;

        const playerSquare = this.#getSquareByCord(playerPos);
        this.#transformSquare(playerSquare, 1);

        return [coord, coord];
    }

    #loadLines() {
        let squareIndex = 1;
        for (let i = 0; i < this.#size; i++) {
            const lineElement = document.createElement("div");
            lineElement.className = "line";
            lineElement.id = "line"+i;
            this.#game.appendChild(lineElement);

            const lineObj = {
                element: lineElement,
                squares: []
            };

            for (let j = 0; j < this.#size; j++) {
                const square = {};

                const squareElement = document.createElement("span");
                squareElement.id = squareIndex;
                lineElement.append(squareElement);

                square.element = squareElement;

                this.#transformSquare(square, 0);
                squareIndex++;

                lineObj.squares.push(square);
            }

            this.#board.push(lineObj);
        }
    }

    #transformSquare(square, number) {        
        square.type = number;
        
        const dictionary = ["square", "square snake", "square apple"];
        const element = square.element;
        element.className = dictionary[number];
    }
}

game = new Game(32);