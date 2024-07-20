import { createTournament } from './touramentComponents/createTournament.mjs'
import { Tournament } from './../../static/js/tournament.js'
import { data as enData } from '../../languages/en/tournament.js'
import { data as frData } from '../../languages/fr/tournament.js'

export const tournament =  async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;
    let tournament = localStorage.getItem('tournament');
    tournament = JSON.parse(tournament) || false;
    tournament = new Tournament(tournament);
    createTournament(render, div, data, tournament);
}