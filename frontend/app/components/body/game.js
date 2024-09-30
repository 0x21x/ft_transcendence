import { isAMatch, popBack } from '../../engine/utils.js';
import { getLanguageDict } from '../../engine/language.js';
import { routes } from '../../engine/routes.js';
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

const popBackIfMatch = async (routeName) => {
    if (isAMatch(location.pathname, routes.find(route => route.name === routeName).path)) {
        return await popBack();
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
        ctx.fillRect(ball.x, ball.y,
            Game.ball.width, Game.ball.height);
        ctx.shadowBlur = 20;
        ctx.shadowColor = (colorTheme === 'light') ? Game.color.light.shadowPaddle : Game.color.dark.shadowPaddle;
        ctx.fillStyle = (colorTheme === 'light') ? Game.color.light.paddle : Game.color.dark.paddle;
        ctx.fillRect(player1.x, player1.y, Game.paddle.width, Game.paddle.height);
        ctx.fillRect(player2.x, player2.y, Game.paddle.width, Game.paddle.height);
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

export const game = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'game');

    render(div, `
        <style>
            .gameContainer {
                display: none;
                margin: auto;
                width: 50vw;
            }
            .startGameContainer {
                font-size: 30px;
                margin: auto;
                margin-top: 30vh;
                text-align: center;
                width: 50vw;
                display: none;
            }
            .waitingPlayers {
                margin-top: 5vh;
                font-size: 30px;
                color: var(--btn-font-color);
            }
            .waitingPlayersContainer {
                margin-top: 30vh;
            }
            .waitingPlayersloader {
                margin: auto;
                font-size:72px;
                color: var(--btn-font-color);
                width: 1em;
                height: 1em;
                box-sizing: border-box;
                background-color: currentcolor;
                position: relative;
                border-radius: 50%;
                transform: rotateX(-60deg) perspective(1000px);
            }
            .waitingPlayersloader:before,
            .waitingPlayersloader:after {
                content: '';
                display: block;
                position: absolute;
                box-sizing: border-box;
                top: 0;
                left: 0;
                width: inherit;
                height: inherit;
                border-radius: inherit;
                animation: flowerFlow 1s ease-out infinite;
            }
            .waitingPlayersloader:after {
                animation-delay: .4s;
            }
        
            @keyframes flowerFlow {
                0% {
                    opacity: 1;
                    transform: rotate(0deg);
                    box-shadow: 0 0 0 -.5em currentcolor,
                    0 0 0 -.5em currentcolor,
                    0 0 0 -.5em currentcolor,
                    0 0 0 -.5em currentcolor,
                    0 0 0 -.5em currentcolor,
                    0 0 0 -.5em currentcolor,
                    0 0 0 -.5em currentcolor,
                    0 0 0 -.5em currentcolor;
                }
                100% {
                    opacity: 0;
                    transform: rotate(180deg);
                    box-shadow: -1em -1em 0 -.35em currentcolor,
                    0 -1.5em 0 -.35em currentcolor,
                    1em -1em 0 -.35em currentcolor,
                    -1.5em 0 0 -.35em currentcolor,
                    1.5em -0 0 -.35em currentcolor,
                    -1em 1em 0 -.35em currentcolor,
                    0 1.5em 0 -.35em currentcolor,
                    1em 1em 0 -.35em currentcolor;
                }
            }
      
        </style>
        <div class="gameContainer container"> 
            <div class="row">
                <canvas id="pong"></canvas>
            </div>
        </div>
        <div class="startGameContainer container">
            <p class="startGame" id="startGame">${data.startGame}</p>
            <button type="button" class="btn button" id="startButton">${data.play}</button>        
        </div>
        <div class="waitingPlayersContainer container text-center">
            <div class="waitingPlayersloader"></div>
            <p class="waitingPlayers">${data.waitingPlayers}</p>
        </div>
    `);

    const gameContainer = document.querySelector('.gameContainer');
    const startGameContainer = document.querySelector('.startGameContainer');
    const waitingPlayersContainer = document.querySelector('.waitingPlayersContainer');
    const buttonStart = document.getElementById('startButton');
    const canvas = document.getElementById('pong');
    const ctx = canvas.getContext('2d');
    canvas.width = Game.size.width;
    canvas.height = Game.size.height;
    const websocket = websocketsHandler.getWs('game');
    if (!websocket) {
        return await popBackIfMatch('game');
    }
    websocket.onclose = async () => {
        await popBackIfMatch('game');
    };
    websocket.onmessage = async (event) => {
        const game_data = JSON.parse(event.data);
        if (game_data.finished || game_data.error) {
            return await popBack();
        } else if (game_data.game_full === true) {
            waitingPlayersContainer.style.display = 'none';
            startGameContainer.style.display = 'block';
        } else if (game_data.game_full === false) {
            waitingPlayersContainer.style.display = 'block';
            startGameContainer.style.display = 'none';
        } else if (game_data.pong) {
            startGameContainer.style.display = 'none';
            gameContainer.style.display = 'block';
            renderPong(ctx, canvas, game_data.pong.player1, game_data.pong.player2, game_data.pong.ball);
        }
    };
    websocketsHandler.handleWebSocketOpen(websocket, (websocket) => {
        websocket.send(JSON.stringify({'action': 'ask'}));
        buttonStart.addEventListener('click', () => {
            websocket.send(JSON.stringify({'action': 'start'}));
        });
        document.onkeydown = (e) => handleKeydown(e, websocket);
    });
};