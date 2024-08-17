import { data as enData } from '../../languages/en/game.js';
import { data as frData } from '../../languages/fr/game.js';
import { redirect } from '../../engine/utils.js';
import { websocketsHandler } from '../../engine/router.js';

const GAME_SIZE = [400, 250];
const PADDLE_SIZE = [10, 50];
const BALL_SIZE = 10;

const Game = {
    maxScore: 5,
    maxGameSaved: 10,
    size: {
        width: GAME_SIZE[0],
        height: GAME_SIZE[1],
    }, ball: {
        width: BALL_SIZE,
        height: BALL_SIZE,
        speed: 1.33,
    }, paddle: {
        width: PADDLE_SIZE[0],
        height: PADDLE_SIZE[1],
        speed: 2,
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

const renderPong = (ctx, canvas, player1, player2, ball) => {
        const colorTheme = localStorage.getItem('theme') || 'light';

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = (colorTheme === 'light') ? Game.color.light.bg : Game.color.dark.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 5;
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = (colorTheme === 'light') ? Game.color.light.middleLine : Game.color.dark.middleLine;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = (colorTheme === 'light') ? Game.color.light.score : Game.color.dark.score;
        ctx.font = 'bold 50px Arial';
        let textWidth = ctx.measureText(player1.score).width;
        ctx.fillText(`${player1.score}`, canvas.width / 4 - (textWidth / 2),60);
        textWidth = ctx.measureText(player2.score).width;
        ctx.fillText(`${player2.score}`, canvas.width / 4 * 3 - (textWidth / 2),60);

        ctx.fillStyle = (colorTheme === 'light') ? Game.color.light.ball : Game.color.dark.ball;
        ctx.fillRect(ball.x - Game.ball.width / 2, ball.y - Game.ball.height / 2,
            Game.ball.width, Game.ball.height);
        ctx.shadowBlur = 20;
        ctx.shadowColor = (colorTheme === 'light') ? Game.color.light.shadowPaddle : Game.color.dark.shadowPaddle;
        ctx.fillStyle = (colorTheme === 'light') ? Game.color.light.paddle : Game.color.dark.paddle;
        ctx.fillRect(player1.x, player1.y - Game.paddle.height / 2, Game.paddle.width,
            Game.paddle.height);
        ctx.fillRect(player2.x, player2.y - Game.paddle.height / 2, Game.paddle.width,
            Game.paddle.height);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 0;
    };

const handleKeydown = (e, ws) => {
    switch (e.keyCode) {
        case 65: // A
            ws.send(JSON.stringify({'action': 'move', 'direction': 'left'}));
            break;
        case 68: // D
            ws.send(JSON.stringify({'action': 'move', 'direction': 'right'}));
            break;
    }
};

export const game = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;

    render(div, `
        <style>
            .container {
                margin-left: auto;
                margin-top: auto;
                width: 70%;
            }
        </style>
        <div class="container"> 
            <div class="row">
                <canvas id="pong"></canvas>
            </div>
            <div class="row">
                <button type="button" class="btn button" id="startButton">${data.play}</button>        
            </div>
        </div>
    `);

    const buttonStart = document.getElementById('startButton');
    const canvas = document.getElementById('pong');
    const ctx = canvas.getContext('2d');
    canvas.width = Game.size.width;
    canvas.height = Game.size.height;
    const websocket = websocketsHandler.getWs('game');
    if (!websocket) {
        return redirect('/games/');
    }
    websocketsHandler.handleWebSocketOpen(websocket, (websocket) => {
        buttonStart.addEventListener('click', () => {
            websocket.send(JSON.stringify({'action': 'start'}));
        });
        document.onkeydown = (e) => handleKeydown(e, websocket);
    });
    websocket.onclose = () => redirect('/games/');
    websocket.onmessage = (event) => {
        const game_data = JSON.parse(event.data);
        if (game_data.finished || game_data.error)
            return redirect('/games/');
        if (game_data.pong)
            renderPong(ctx, canvas, game_data.pong.player1, game_data.pong.player2, game_data.pong.ball);
    };


};