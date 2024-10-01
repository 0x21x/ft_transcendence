export const loaded = () => {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
    const app = document.getElementById('app');
    app.style.display = 'block';
    const navbar = document.getElementById('navbar');
    navbar.style.display = 'block';
};