import { createTournament } from './touramentComponents/createTournament.mjs'
import { Tournament } from './../../static/js/tournament.js'

export const tournament =  async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const url = `languages/${language}/tournament.json`;
    const response = await fetch(url);
    const data = await response.json();
    let tournament = localStorage.getItem('tournament');
    tournament = JSON.parse(tournament) || false;
    tournament = new Tournament(tournament);
    createTournament(render, div, data, tournament);
}