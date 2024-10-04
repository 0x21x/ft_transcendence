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
    errorContainer.innerHTML = `
        <svg xmlns = "http://www.w3.org/2000/svg" style = "display: none;">
            <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </symbol>
            <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </symbol>
            <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </symbol>
        </svg>
    `;
    div.insertBefore(errorContainer, div.children[0]);
};

const errorTypes = [
    {'name': 'primary', 'icon': 'info'},
    {'name': 'secondary', 'icon': 'info'},
    {'name': 'success', 'icon': 'success'},
    {'name': 'danger', 'icon': 'warning'},
    {'name': 'warning', 'icon': 'warning'},
    {'name': 'info', 'icon': 'info'},
    {'name': 'light', 'icon': 'info'},
    {'name': 'dark', 'icon': 'info'}
];

export const error = (errorString, errorType, icon='') => {
    const language = localStorage.getItem('language') || 'en';

    const errorContainer = document.getElementById('errorContainer');
    if (!errorContainer)
        return;
    if (!errorTypes.some((type) => type.name === errorType)) {
        return;
    }

    let errorIcon = '';
    if (icon !== '' && errorTypes.some((type) => type.icon === icon)) {
        errorIcon = icon;
    } else {
        errorIcon = errorTypes.find((type) => type.name === errorType).icon;
    }

    if (errorContainer.children.length >= 3) {
        clearTimeout(errorContainer.children[0].timeout);
        errorContainer.removeChild(errorContainer.children[0]);
    }

    const error = document.createElement('div');
    error.classList.add('alert', 'alert-' + errorType);
    error.role = 'alert';
    switch (errorIcon) {
        case 'success':
            error.innerHTML = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg';
            break;
        case 'warning':
            error.innerHTML = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg';
            break;
        case 'info':
            error.innerHTML = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg';
            break;
    }
    error.innerHTML += getLanguageDict(language, errorString, errorDict);
    errorContainer.appendChild(error);
    error.timeout = setTimeout(() => {
        errorContainer.removeChild(error);
    }, 4000);
};