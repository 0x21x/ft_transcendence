export const themeHandler = (body, checked, loading=false) => {
    if (!body || !checked) {
        return ;
    }

    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark' && loading) {
        checked.checked = true;
    }

    if (checked.checked) {
        body.setAttribute('theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('theme', 'light');
        localStorage.setItem('theme', 'light');
    }
};