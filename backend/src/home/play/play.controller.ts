import { Controller, Post, Body, Headers, Get, Query, Param } from "@nestjs/common";
import { PlayService } from "./play.service";

@Controller('/api/users/play')
export class PlayController {
    constructor(private playService: PlayService){
    }
    
}