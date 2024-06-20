export class Tournament {
    constructor(json=false) {
        if (json) {
            this.loadFromJson(json);
            return ;
        }
        this.name = undefined;
        this.nbPlayers = undefined;
        this.actualRow = undefined;
        this.players = [];
        this.games = [];
    }

    setName(name) {
        if (this.name !== undefined) { return ; }
        this.name = name;
    }

    setNbPlayers(nbPlayers) {
        this.nbPlayers = parseInt(nbPlayers);
    }

    addPlayer(playerName) {
        this.players.push({name: playerName});
    }

    calculateGames() {
        if (this.actualRow === undefined) {
            let gamesInRow = this.nbPlayers;
            this.actualRow = 0;
            for (let i = 0; gamesInRow >= 1; i++) {
                const games = [];
                for (let j = 0; j < gamesInRow; j++) {
                    const game = {'id1': 'tim', 'score1': undefined, 'id2': 'tim', 'score2': undefined};
                    games.push(game);
                }
                this.games.push(games);
                if (gamesInRow === 1) { break; }
                gamesInRow /= 2;
            }
        }
    }

    loadFromJson(json) {
        this.name = json[0].name || undefined;
        this.nbPlayers = json[0].nbPlayers || undefined;
        this.actualRow = json[0].actualRow || undefined;
        // let players = json[1].players;
        // players.forEach((player) => {});
    }

    toJson() {
        const json = [];
        json.push({name: this.name, nbPlayers: this.nbPlayers, actualRow: this.actualRow});
        json.push({players:Array.from(this.players.entries()), games:Array.from(this.games.entries())});
        return json;
    }
}