import { error } from "../../components/body/error.mjs";
import { game } from "../../components/body/game.mjs"
import { history } from "../../components/body/history.mjs"
import { tournament } from "../../components/body/tournament.mjs";
import { login } from "../../components/body/auth/login.mjs";
import { profile } from "../../components/body/profile.mjs";
import { register } from "../../components/body/auth/register.mjs";
import { home } from "../../components/body/home.mjs";
import { render } from "./render.mjs"
import { welcome } from "../../components/body/welcome.mjs";

export const a = Object.freeze({
    'Everyone': 1,
    'Logged': 2,
    'Unlogged': 3,
    'Admin': 4
});

export const routes = [
    { path: "/", view: (app) => home(render, app), authorization: a.Logged, name: "home"},
    { path: "/game", view: (app) => game(render, app), authorization: a.Logged, name: "game" },
    { path: "/history", view: (app) => history(render, app), authorization: a.Logged, name: "history" },
    { path: "/tournament", view: (app) => tournament(render, app), authorization: a.Logged, name: "tournament" },
    { path: "/register", view: (app) => register(render, app), authorization: a.Unlogged, name: "register" },
    { path: "/profile", view: (app) => profile(render, app), authorization: a.Logged, name: "profile" },
    { path: "/login", view: (app) => login(render, app), authorization: a.Unlogged, name: "login" },
    { path: "/welcome", view: (app) => welcome(render, app), authorization: a.Unlogged, name: "welcome"},
    { path: "/error/404", view: (app) => error(render, app, 404), authorization: a.Everyone, name: "404"}
    ];