import { getLanguageDict } from './language.js';
const en = getLanguageDict('en', 'error');
const fr = getLanguageDict('fr', 'error');
const es = getLanguageDict('es', 'error');

const errorDict = [
    {'name': 'Unknown error', 'en': en.unknownError, 'fr': fr.unknownError, 'es': es.unknownError},
    {'name': 'Invalid username or password', 'en': en.invalidUserOrPassword, 'fr': fr.invalidUserOrPassword, 'es': es.invalidUserOrPassword},
    {'name': 'Invalid user', 'en': en.invalidUser, 'fr': fr.invalidUser, 'es': es.invalidUser},
    {'name': 'Invalid request', 'en': en.invalidRequest, 'fr': fr.invalidRequest, 'es': es.invalidRequest},
    {'name': 'Invalid username', 'en': en.invalidUsername, 'fr': fr.invalidUsername, 'es': es.invalidUsername},
    {'name': 'Invalid password new password', 'en': en.invalidNewPassword, 'fr': fr.invalidNewPassword, 'es': es.invalidNewPassword},
    {'name': 'Invalid password old password', 'en': en.invalidOldPassword, 'fr': fr.invalidOldPassword, 'es': es.invalidOldPassword},
    {'name': 'Error while creating tournament', 'en': en.errorWhileCreatingTournament, 'fr': fr.errorWhileCreatingTournament, 'es': es.errorWhileCreatingTournament},
    {'name': 'Invalid name or number of players', 'en': en.invalidNameOrNumberOfPlayers, 'fr': fr.invalidNameOrNumberOfPlayers, 'es': es.invalidNameOrNumberOfPlayers},
    {'name': 'Game already exists', 'en': en.gameAlreadyExists, 'fr': fr.gameAlreadyExists, 'es': es.gameAlreadyExists},
    {'name': 'You\'re already friends', 'en': en.alreadyFriends, 'fr': fr.alreadyFriends, 'es': es.alreadyFriends},
    {'name': 'Invalid avatar', 'en': en.invalidAvatar, 'fr': fr.invalidAvatar, 'es': es.invalidAvatar},
    {'name': 'Avatar too big', 'en': en.avatarTooBig, 'fr': fr.avatarTooBig, 'es': es.avatarTooBig},
    {'name': 'Username already exists', 'en': en.usernameAlreadyExists, 'fr': fr.usernameAlreadyExists, 'es': es.usernameAlreadyExists},
    {'name': 'Tournament not found', 'en': en.tournamentNotFound, 'fr': fr.tournamentNotFound, 'es': es.tournamentNotFound},
    {'name': 'Tournament is already full', 'en': en.tournamentIsAlreadyFull, 'fr': fr.tournamentIsAlreadyFull, 'es': es.tournamentIsAlreadyFull}
];

export const addErrorContainer = (div) => {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('container-xl', 'container-error');
    errorContainer.id = 'errorContainer';
    div.insertBefore(errorContainer, div.children[0]);
};

export const error = (errorString, errorType) => {
    const language = localStorage.getItem('language') || 'en';

    const errorContainer = document.getElementById('errorContainer');
    if (!errorContainer)
        return;
    if (!['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(errorType)) {
        return;
    }

    if (errorContainer.children.length >= 3) {
        clearTimeout(errorContainer.children[0].timeout);
        errorContainer.removeChild(errorContainer.children[0]);
    }

    const error = document.createElement('div');
    error.classList.add('alert', 'alert-' + errorType);
    error.role = 'alert';
    error.innerHTML = getLanguageDict(language, errorString, errorDict);
    errorContainer.appendChild(error);
    error.timeout = setTimeout(() => {
        errorContainer.removeChild(error);
    }, 4000);
};