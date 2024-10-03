export const addErrorContainer = (div) => {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('container-xl', 'container-error');
    errorContainer.id = 'errorContainer';
    div.insertBefore(errorContainer, div.children[0]);
};

export const error = (errorString, errorType) => {
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
    error.innerHTML = errorString;
    errorContainer.appendChild(error);
    error.timeout = setTimeout(() => {
        errorContainer.removeChild(error);
    }, 4000);
};