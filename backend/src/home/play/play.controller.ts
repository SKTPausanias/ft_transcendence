import { Controller, Post, Body, Headers, Get, Query, Param } from "@nestjs/common";
import { WaitRoomI } from "./iPlay";
import { PlayService } from "./play.service";

@Controller('/api/users/play')
export class PlayController {
    constructor(private playService: PlayService){
    }

    @Get('/liveGames')
    async getLiveGames(@Headers() headers): Promise<WaitRoomI[]> {
        return await this.playService.getLiveGames(headers.authorization);
    }
    
}