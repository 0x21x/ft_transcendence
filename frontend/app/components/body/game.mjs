import {Game} from "../../static/js/game.js"
import { data as enData } from '../../languages/en/game.js'
import { data as frData } from '../../languages/fr/game.js'


export const game = async (render, div) => {
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
                <div class="col">
                    <div class="form-outline form-control-sm">
                        <input type="text" class="form-control form" id="player1Name" placeholder="${data.playerNameField} 1"/>
                    </div>
                </div>
                <div class="col">
                    <div class="form-outline form-control-sm">
                        <input type="text" class="form-control form" id="player2Name"placeholder="${data.playerNameField} 2"/>
                    </div>
                </div>
                <button type="button" class="btn button" id="startButton">${data.play}</button>
            </div>
            
            <button type="button" class="btn button" id="sendButton">Send Message</button>
        </div>
    `);

    let game = new Game('pong');
    const theme = document.querySelector('input[name=themeSwitcher]');
    const buttonStart = document.getElementById('startButton');
    const names = {
        player1: document.getElementById('player1Name'),
        player2: document.getElementById('player2Name'),
    }

    game.render();
    theme.addEventListener('change', () => {
        if (game.ended) { game.render(); }
    });
    buttonStart.addEventListener('click', () => {
        if (game.ended && names.player1.value && names.player2.value && (names.player1.value !== names.player2.value)) {
            game.setNames(names.player1.value, names.player2.value);
            game.loop(true);
        }
    });

    const sendButton = document.getElementById('sendButton');
    const websocket = new WebSocket('ws://localhost:5002/game/');
    websocket.onopen = () => {
        sendButton.addEventListener('click', () => {
            for (let i = 0; i < 10; i++) {
                const message = {'message': 'Hello'};
                websocket.send(JSON.stringify(message));
            }
        });
    };
};
