import { error } from "../../components/body/error.mjs";
import { game } from "../../components/body/game.mjs"
import { history } from "../../components/body/history.mjs"
import { tournament } from "../../components/body/tournament.mjs";
import { login } from "../../components/body/auth/login.mjs";
import { profile } from "../../components/body/profile.mjs";
import { register } from "../../components/body/auth/register.mjs";
import { home } from "../../components/body/home.mjs";
import { user } from "../../components/body/user.mjs";
import { render } from "./render.mjs"
import { welcome } from "../../components/body/welcome.mjs";

export const a = Object.freeze({
    'Everyone': 1,
    'Logged': 2,
    'Unlogged': 3,
    'Admin': 4
});

export const routes = [
    { path: "/", view: (app, args) => home(render, app, args), authorization: a.Logged, name: "home"},
    { path: "/game", view: (app, args) => game(render, app, args), authorization: a.Logged, name: "game" },
    { path: "/history", view: (app, args) => history(render, app, args), authorization: a.Logged, name: "history" },
    { path: "/tournament", view: (app, args) => tournament(render, app, args), authorization: a.Logged, name: "tournament" },
    { path: "/register", view: (app, args) => register(render, app, args), authorization: a.Unlogged, name: "register" },
    { path: "/login", view: (app, args) => login(render, app, args), authorization: a.Unlogged, name: "login" },
    { path: "/profile", view: (app, args) => profile(render, app, args), authorization: a.Logged, name: "profile" },
    { path: "/user/*", view: (app, args) => user(render, app, args), authorization: a.Logged, name: "user" },
    { path: "/welcome", view: (app, args) => welcome(render, app, args), authorization: a.Unlogged, name: "welcome"},
    { path: "/error/404", view: (app) => error(render, app, '404'), authorization: a.Everyone, name: "error"}
    ];