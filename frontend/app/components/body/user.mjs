import { error } from "./error.mjs";

export const getUserInfo = async (args) => {
    if (args.length !== 1)
        throw new Error('Invalid number of arguments');
    let response = await fetch(`http://localhost:5002/api/users/${args[0]}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status !== 200)
        return null;
    return await response.json()
}

export const user = async (render, div, args) => {
    const userInfo = await getUserInfo(args);
    if (userInfo === null)
        return error(render, div, 'User not found');
    const avatar_url = 'http://localhost:5002/api' + userInfo.avatar;

    render(div, `
        <style>
            .profileContainer {
                margin-top: 20px;
                width: 300px;
            }
            .avatar {
                margin-left: 100px;
            }
            .col {
                margin-top: 10px;
                margin-bottom: 10px;
            }
        </style>
        <div class="container profileContainer">
            <img src="${avatar_url}" alt="Avatar" class="avatar rounded-circle" style="width: 100px; height: 100px;">
            <h1>${userInfo.username}</h1>
        </div>
    `);
};