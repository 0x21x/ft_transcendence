const scale = ((window.innerWidth * 0.6) * 0.75 <= window.innerHeight * 0.5)
    ? window.innerWidth * 0.7 / 400 : window.innerHeight * 0.5 / 300;

const GAME = {
    maxScore: 5,
    maxGameSaved: 10,
    scale: scale,
    size: {
        width: 400 * scale,
        height: 300 * scale,
    }, ball: {
        width: 10 * scale,
        height: 10 * scale,
        speed: 1.33 * scale,
    }, paddle: {
        width: 10 * scale,
        height: 50 * scale,
        speed: 2 * scale,
    }, color: {
        light: {
            bg: '#eeeeee',
            paddle: '#222831',
            ball: '#ff5722',
            middleLine: '#dedede',
            score: '#dedede',
            shadowPaddle: '#ff5722',
        }, dark: {
            bg: '#262c36',
            paddle: '#eeeeee',
            ball: '#ff5722',
            middleLine: '#393e46',
            score: '#393e46',
            shadowPaddle: '#ff5722',
        }
    }
};

Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
};

export class Game {
    constructor() {
        this.canvas = document.getElementById('pong');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GAME.size.width;
        this.canvas.height = GAME.size.height;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            vx: [-GAME.ball.speed, GAME.ball.speed].sample(),
            vy: [-GAME.ball.speed, GAME.ball.speed].sample(),
        };
        this.player = {
            name: 'Undefined',
            x: 0,
            y: this.canvas.height / 2,
            score: 0,
        };
        this.player2 = {
            name: 'Undefined',
            x: this.canvas.width - GAME.paddle.width,
            y: this.canvas.height / 2,
            score: 0,
        };
        this.ended = true;
        this.handleKeydown = this.handleKeydown.bind(this);
        document.onkeydown = (e) => this.handleKeydown(e, this);
    }

    reset(scoreReset=false) {
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            vx: [-GAME.ball.speed, GAME.ball.speed].sample(),
            vy: [-GAME.ball.speed, GAME.ball.speed].sample(),
        };
        if (scoreReset) {
            const game = {
                player1:this.player.name,
                score1:this.player.score,
                player2:this.player2.name,
                score2:this.player2.score
            };
            const data = JSON.parse(localStorage.getItem('history')) || [];
            if (data.length >= GAME.maxGameSaved ) { data.splice(0, 1); }
            data.push(game);
            localStorage.setItem('history', JSON.stringify(data));
        }
        this.player = {
            name: (scoreReset) ? undefined : this.player.name,
            x: 0,
            y: this.canvas.height / 2,
            score: (scoreReset) ? 0 : this.player.score,
        };
        this.player2 = {
            name: (scoreReset) ? undefined : this.player2.name,
            x: this.canvas.width - GAME.paddle.width,
            y: this.canvas.height / 2,
            score: (scoreReset) ? 0 : this.player2.score,
        };
        return scoreReset;
    }

    handleKeydown(e, env) {
    switch (e.keyCode) {
        case 38:
            env.player2.y -= GAME.paddle.speed;
            break;
        case 40:
            env.player2.y += GAME.paddle.speed;
            break;
        case 87:
            env.player.y -= GAME.paddle.speed;
            break;
        case 83:
            env.player.y += GAME.paddle.speed;
            break;
        case 32:
            if (env.ended) { this.loop(true); }
            break;
        }

    }

    render = () => {
        const colorTheme = localStorage.getItem('theme') || 'light';

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = (colorTheme === 'light') ? GAME.color.light.bg : GAME.color.dark.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.lineWidth = 5 * scale;
        this.ctx.setLineDash([5 * scale, 5 * scale]);
        this.ctx.strokeStyle = (colorTheme === 'light') ? GAME.color.light.middleLine : GAME.color.dark.middleLine;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.fillStyle = (colorTheme === 'light') ? GAME.color.light.score : GAME.color.dark.score;
        this.ctx.font = `bold ${50 * GAME.scale}px Arial`;
        let textWidth = this.ctx.measureText(this.player.score).width;
        this.ctx.fillText(`${this.player.score}`, this.canvas.width / 4 - (textWidth / 2),60 * scale);
        textWidth = this.ctx.measureText(this.player2.score).width;
        this.ctx.fillText(`${this.player2.score}`, this.canvas.width / 4 * 3 - (textWidth / 2),60 * scale);

        this.ctx.fillStyle = (colorTheme === 'light') ? GAME.color.light.ball : GAME.color.dark.ball;
        this.ctx.fillRect(this.ball.x - GAME.ball.width / 2, this.ball.y - GAME.ball.height / 2,
            GAME.ball.width, GAME.ball.height);
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = (colorTheme === 'light') ? GAME.color.light.shadowPaddle : GAME.color.dark.shadowPaddle;
        this.ctx.fillStyle = (colorTheme === 'light') ? GAME.color.light.paddle : GAME.color.dark.paddle;
        this.ctx.fillRect(this.player.x, this.player.y - GAME.paddle.height / 2, GAME.paddle.width,
            GAME.paddle.height);
        this.ctx.fillRect(this.player2.x, this.player2.y - GAME.paddle.height / 2, GAME.paddle.width,
            GAME.paddle.height);
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 0;
    };

    setNames = (name1, name2) => {
        this.player.name = name1;
        this.player2.name = name2;
    };

    namesHasSet = () => !(this.player.name === undefined || this.player2.name === undefined);

    loop = (first=false) => {
        if (first) { this.reset(); }
        if (!this.namesHasSet()) { return ; }
        this.ended = false;

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        if (this.ball.x <= GAME.ball.width && this.player.y <= this.ball.y + GAME.ball.height
            && this.player.y + GAME.paddle.height >= this.ball.y && this.ball.vx < 0) {
            this.ball.vx *= -1;
        }
        else if (this.ball.x >= GAME.size.width - GAME.ball.width
            && this.player2.y <= this.ball.y + GAME.ball.height
            && this.player2.y + GAME.paddle.height >= this.ball.y
            && this.ball.vx > 0) {
            this.ball.vx *= -1;
        } else if (this.ball.y <= 0 || this.ball.y + GAME.ball.height >= this.canvas.height) {
            this.ball.vy *= -1;
        } else if (this.ball.x <= 0) {
            this.player2.score++;
            this.ended = this.reset(this.player2.score >= GAME.maxScore);
        } else if (this.ball.x >= this.canvas.width) {
            this.player.score++;
            this.ended = this.reset(this.player.score >= GAME.maxScore);
        }
        this.render();
        if (this.ended) { return ;}
        requestAnimationFrame(this.loop.bind(this, false));
    };
}