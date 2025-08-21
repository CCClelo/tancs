#!/usr/bin/env node

/**
 * 命令行版本的贪吃蛇游戏
 * 使用方向键控制蛇的移动
 */

const readline = require('readline');
const process = require('process');

class SnakeGame {
    constructor() {
        this.width = 20;
        this.height = 10;
        this.snake = [{ x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) }];
        this.direction = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = true;
        
        // 设置控制台
        this.setupInput();
        
        console.clear();
        console.log('🐍 贪吃蛇游戏');
        console.log('使用方向键控制蛇的移动，按 q 退出游戏');
        console.log('----------------------------');
    }

    setupInput() {
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }

        process.stdin.on('keypress', (str, key) => {
            if (!this.gameRunning) return;

            if (key.ctrl && key.name === 'c') {
                process.exit();
            }

            switch (key.name) {
                case 'up':
                    if (this.direction.y === 0) {
                        this.direction = { x: 0, y: -1 };
                    }
                    break;
                case 'down':
                    if (this.direction.y === 0) {
                        this.direction = { x: 0, y: 1 };
                    }
                    break;
                case 'left':
                    if (this.direction.x === 0) {
                        this.direction = { x: -1, y: 0 };
                    }
                    break;
                case 'right':
                    if (this.direction.x === 0) {
                        this.direction = { x: 1, y: 0 };
                    }
                    break;
                case 'q':
                    this.gameOver('游戏退出');
                    break;
                case 'r':
                    if (!this.gameRunning) {
                        this.restart();
                    }
                    break;
            }
        });
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }

    update() {
        if (!this.gameRunning) return;

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // 检查边界碰撞
        if (head.x < 0 || head.x >= this.width || head.y < 0 || head.y >= this.height) {
            this.gameOver('撞墙了！');
            return;
        }

        // 检查自身碰撞
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver('撞到自己了！');
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        console.clear();
        console.log('🐍 贪吃蛇游戏');
        console.log(`得分: ${this.score}`);
        console.log('----------------------------');

        for (let y = 0; y < this.height; y++) {
            let line = '';
            for (let x = 0; x < this.width; x++) {
                if (this.snake[0].x === x && this.snake[0].y === y) {
                    line += '🟢'; // 蛇头
                } else if (this.snake.some(segment => segment.x === x && segment.y === y)) {
                    line += '🟩'; // 蛇身
                } else if (this.food.x === x && this.food.y === y) {
                    line += '🍎'; // 食物
                } else {
                    line += '⬛'; // 空白
                }
            }
            console.log(line);
        }

        if (this.gameRunning) {
            console.log('\n方向键控制移动，q 退出');
        }
    }

    gameOver(reason) {
        this.gameRunning = false;
        console.clear();
        console.log('🐍 贪吃蛇游戏');
        console.log('----------------------------');
        console.log(`游戏结束！${reason}`);
        console.log(`最终得分: ${this.score}`);
        console.log(`蛇的长度: ${this.snake.length}`);
        console.log('----------------------------');
        console.log('按 r 重新开始，按 Ctrl+C 退出');
    }

    restart() {
        this.snake = [{ x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) }];
        this.direction = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = true;
        console.log('游戏重新开始！');
    }

    start() {
        this.draw();
        setInterval(() => {
            this.update();
            this.draw();
        }, 300);
    }
}

// 启动游戏
const game = new SnakeGame();
game.start();
