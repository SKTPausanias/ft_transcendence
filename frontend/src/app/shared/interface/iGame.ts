export interface iPlayer {
    login: string,
    nickname: string,
    winner: boolean,
}

export interface iGame {
    player1: iPlayer,
    player2: iPlayer
}
