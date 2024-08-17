import { Tournament } from '../../engine/tournament.js';
import { createTournament } from './touramentComponents/createTournament.js';
import { data as enData } from '../../languages/en/tournament.js';
import { data as frData } from '../../languages/fr/tournament.js';

export const tournament = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;
    let tournament = localStorage.getItem('tournament');
    tournament = JSON.parse(tournament) || false;
    tournament = new Tournament(tournament);
    createTournament(render, div, data, tournament);
};