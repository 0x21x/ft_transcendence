const languages = {
    'en': 0,
    'fr': 1,
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
        }
    }
    switch (actualLanguage) {
        case 'fr':
            event.selectedIndex = languages.fr;
            localStorage.setItem('language', actualLanguage);
            return;
        case 'en':
            event.selectedIndex = languages.en;
            localStorage.setItem('language', actualLanguage);
            
    }
};