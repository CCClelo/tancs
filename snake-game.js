// 贪吃蛇游戏类
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.newHighScoreElement = document.getElementById('newHighScore');
        
        // 游戏配置
        this.gridSize = 20;
        this.canvasSize = 400;
        this.gridCount = this.canvasSize / this.gridSize;
        
        // 游戏状态
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.isPaused = false;
        this.gameRunning = false;
        
        // 蛇的初始状态
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // 移动方向
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // 食物位置
        this.food = this.generateFood();
        
        // 初始化
        this.updateHighScoreDisplay();
        this.bindEvents();
        this.gameLoop();
    }
    
    // 生成随机食物位置
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridCount),
                y: Math.floor(Math.random() * this.gridCount)
            };
        } while (this.isSnakePosition(food));
        
        return food;
    }
    
    // 检查位置是否在蛇身上
    isSnakePosition(pos) {
        return this.snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    }
    
    // 绑定键盘事件
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch (e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // 触摸控制支持
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平滑动
                if (dx > 30 && this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                } else if (dx < -30 && this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
            } else {
                // 垂直滑动
                if (dy > 30 && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                } else if (dy < -30 && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
            }
        });
    }
    
    // 更新游戏状态
    update() {
        if (!this.gameRunning || this.isPaused) return;
        
        // 更新方向
        this.direction = { ...this.nextDirection };
        
        // 移动蛇头
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查撞墙
        if (head.x < 0 || head.x >= this.gridCount || 
            head.y < 0 || head.y >= this.gridCount) {
            this.gameOver();
            return;
        }
        
        // 检查撞到自己
        if (this.isSnakePosition(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            
            // 增加难度 - 随着分数增加，游戏速度加快
            if (this.score % 50 === 0) {
                clearInterval(this.gameInterval);
                this.gameInterval = setInterval(() => this.update(), Math.max(50, 150 - this.score / 10));
            }
        } else {
            this.snake.pop();
        }
    }
    
    // 渲染游戏画面
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // 绘制网格 (可选，增加视觉效果)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.gridCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvasSize);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvasSize, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头 - 渐变绿色
                const gradient = this.ctx.createRadialGradient(
                    segment.x * this.gridSize + this.gridSize/2,
                    segment.y * this.gridSize + this.gridSize/2,
                    0,
                    segment.x * this.gridSize + this.gridSize/2,
                    segment.y * this.gridSize + this.gridSize/2,
                    this.gridSize/2
                );
                gradient.addColorStop(0, '#4ecdc4');
                gradient.addColorStop(1, '#44a08d');
                this.ctx.fillStyle = gradient;
            } else {
                // 蛇身 - 渐变效果
                const alpha = Math.max(0.3, 1 - index * 0.05);
                this.ctx.fillStyle = `rgba(76, 205, 196, ${alpha})`;
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // 给蛇身添加边框
            if (index === 0) {
                this.ctx.strokeStyle = '#2c3e50';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
            }
        });
        
        // 绘制食物 - 苹果效果
        const foodX = this.food.x * this.gridSize;
        const foodY = this.food.y * this.gridSize;
        
        const foodGradient = this.ctx.createRadialGradient(
            foodX + this.gridSize/2,
            foodY + this.gridSize/2,
            0,
            foodX + this.gridSize/2,
            foodY + this.gridSize/2,
            this.gridSize/2
        );
        foodGradient.addColorStop(0, '#ff6b6b');
        foodGradient.addColorStop(1, '#ee5a24');
        
        this.ctx.fillStyle = foodGradient;
        this.ctx.beginPath();
        this.ctx.arc(
            foodX + this.gridSize/2,
            foodY + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 食物高光效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(
            foodX + this.gridSize/3,
            foodY + this.gridSize/3,
            this.gridSize/6,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 暂停提示
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏暂停', this.canvasSize/2, this.canvasSize/2 - 10);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('按空格键继续', this.canvasSize/2, this.canvasSize/2 + 20);
        }
    }
    
    // 游戏主循环
    gameLoop() {
        this.gameRunning = true;
        this.gameInterval = setInterval(() => this.update(), 150);
        this.renderInterval = setInterval(() => this.render(), 1000/60); // 60 FPS
    }
    
    // 暂停/继续游戏
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.querySelector('.pause-btn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
    }
    
    // 更新分数显示
    updateScore() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.updateHighScoreDisplay();
            localStorage.setItem('snakeHighScore', this.highScore);
        }
    }
    
    // 更新最高分显示
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    // 游戏结束
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameInterval);
        clearInterval(this.renderInterval);
        
        this.finalScoreElement.textContent = this.score;
        if (this.score === this.highScore && this.score > 0) {
            this.newHighScoreElement.style.display = 'block';
        } else {
            this.newHighScoreElement.style.display = 'none';
        }
        
        this.gameOverScreen.style.display = 'flex';
    }
    
    // 重新开始游戏
    restart() {
        // 重置游戏状态
        this.score = 0;
        this.isPaused = false;
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.generateFood();
        
        // 更新显示
        this.updateScore();
        this.gameOverScreen.style.display = 'none';
        
        // 重置按钮文本
        const pauseBtn = document.querySelector('.pause-btn');
        pauseBtn.textContent = '暂停';
        
        // 重新开始游戏循环
        this.gameLoop();
    }
}

// 全局函数
let game;

function initGame() {
    game = new SnakeGame();
}

function togglePause() {
    if (game) {
        game.togglePause();
    }
}

function restartGame() {
    if (game) {
        game.restart();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);

// 防止方向键滚动页面
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});
