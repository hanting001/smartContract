import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import * as moment from 'moment';

@Injectable()
export class WCCService {
    constructor(private web3Service: Web3Service) { }
    // 测试-获取所有信息
    async getAllInfo() {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        // 获取所有已添加的场次信息
        const gameIndexes = await sc.methods.getAllGameIndexes().call();

        // 获取所有场次的详细信息
        const gameInfos = [];
        for (let index of gameIndexes) {
            const gameInfo = await sc.methods.getGameInfo(index).call();
            gameInfos.push(gameInfo);
        }
        // 获取场次的下注信息，这里取第一场
        const gameIndex = gameIndexes[0];
        const scoreIndexes = await sc.methods.getGameScoreIndexes(gameIndex).call();
        // 获取该场次的所有下注详细信息
        const scoreInfos = [];
        for (let scoreIndex of scoreIndexes) {
            const scoreInfo = await sc.methods.getGameScoreTotalInfo(gameIndex, scoreIndex).call();
            scoreInfos.push(scoreInfo);
        }
        // 获取用户下注的场次信息
        const userJoinedGameIndexes = await sc.methods.getUserJoinedGameIndexes().call();
        // 这里只测试一场
        const userJoinedGameIndex = userJoinedGameIndexes[0];
        // 判断是否下注
        const isJoinedGame = await sc.methods.isJoinedGame(userJoinedGameIndex).call();
        // 获取用户在某场次下的所有下注信息
        const uerJoinedGameScoreIndexes = await sc.methods.getUserJoinedGameScoreIndexes(userJoinedGameIndex).call();
        // 获取所有下注的详细信息
        const uerJoinedGameScoreInfos = [];
        for (let uerJoinedGameScoreIndex of uerJoinedGameScoreIndexes) {
            const uerJoinedGameScoreInfo = await sc.methods.
                getUserJoinedGameScoreInfo(userJoinedGameIndex, uerJoinedGameScoreIndex).call();
            uerJoinedGameScoreInfos.push(uerJoinedGameScoreInfo);
        }
        return {
            gameIndexes: gameIndexes,
            gameInfos: gameInfos,
            scoreIndexes: scoreIndexes,
            scoreInfos: scoreInfos,
            userJoinedGameIndexes: userJoinedGameIndexes,
            isJoinedGame: isJoinedGame,
            uerJoinedGameScoreIndexes: uerJoinedGameScoreIndexes,
            uerJoinedGameScoreInfos: uerJoinedGameScoreInfos
        };
    }
}
