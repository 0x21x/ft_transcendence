import { Tournament } from '../../engine/tournament.js';
import { createTournament } from './touramentComponents/createTournament.js';
import { getLanguageDict } from '../../engine/language.js';

export const tournament = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'tournament');
    let tournament = localStorage.getItem('tournament');
    tournament = JSON.parse(tournament) || false;
    tournament = new Tournament(tournament);
    createTournament(render, div, data, tournament);
};