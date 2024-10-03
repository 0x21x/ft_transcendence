import { data as en } from '../languages/en/index.js';
import { data as es } from '../languages/es/index.js';
import { data as fr } from '../languages/fr/index.js';

const languages = {
    'en': 0,
    'fr': 1,
    'es': 2
};

const dictionary = [
    {'name': 'auth', 'en': en.auth, 'fr': fr.auth, 'es': es.auth},
    {'name': 'game', 'en': en.game, 'fr': fr.game, 'es': es.game},
    {'name': 'history', 'en': en.history, 'fr': fr.history, 'es': es.history},
    {'name': 'navbar', 'en': en.navbar, 'fr': fr.navbar, 'es': es.navbar},
    {'name': 'otp', 'en': en.otp, 'fr': fr.otp, 'es': es.otp},
    {'name': 'profile', 'en': en.profile, 'fr': fr.profile, 'es': es.profile},
    {'name': 'tournament', 'en': en.tournament, 'fr': fr.tournament, 'es': es.tournament},
    {'name': 'welcome', 'en': en.welcome, 'fr': fr.welcome, 'es': es.welcome},
    {'name': 'error', 'en': en.error, 'fr': fr.error, 'es': es.error}
];

export const getLanguageDict = (language, dictName, customDict=[]) => {
    const Dict = customDict.length > 0 ? customDict : dictionary;
    if (!dictName || Dict.find(dict => dict.name === dictName) === undefined) { return null; }
    if (!language || ['en', 'fr', 'es'].indexOf(language) === -1) { return null; }
    return Dict.find(dict => dict.name === dictName)[language];
};

export const languageHandler = (event, loading=false) => {
    if (!event) {
        return ;
    }

    const setLanguage = localStorage.getItem('language') || 'en';
    const actualLanguage = event.options[event.selectedIndex].getAttribute('id');
    if (setLanguage !== actualLanguage && loading) {
        switch (setLanguage) {
            case 'fr':
                event.selectedIndex = languages.fr;
                return;
            case 'en':
                event.selectedIndex = languages.en;
                return;
            case 'es':
                event.selectedIndex = languages.es;
                return;
        }
    }
    switch (actualLanguage) {
        case 'fr':
            event.selectedIndex = languages.fr;
            localStorage.setItem('language', actualLanguage);
            break;
        case 'en':
            event.selectedIndex = languages.en;
            localStorage.setItem('language', actualLanguage);
            break;
        case 'es':
            event.selectedIndex = languages.es;
            localStorage.setItem('language', actualLanguage);
    }
};