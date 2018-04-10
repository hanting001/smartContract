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
        if (!userJoinedGameIndex) {
            return {
                gameIndexes: gameIndexes,
                gameInfos: gameInfos,
                scoreIndexes: scoreIndexes,
                scoreInfos: scoreInfos
            };
        }
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
        // 获取投票信息
        const account = await this.web3Service.getMainAccount();
        console.log(`account:${account}`);
        const voteInfo = await sc.methods.voteInfos(userJoinedGameIndex).call();
        if (!voteInfo.isValued) {
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
        const userVote = await sc.methods.userVotes(userJoinedGameIndex, account).call();

        // 查看是否赢了
        const player = await this.web3Service.getContract('wccPlayer', 'WccPlayer');

        const isWin = await player.methods.isWin(userJoinedGameIndex, uerJoinedGameScoreIndexes[0]).call();
        const claimCheck = await player.methods.claimCheck(userJoinedGameIndex, uerJoinedGameScoreIndexes[0]).call();
        return {
            gameIndexes: gameIndexes,
            gameInfos: gameInfos,
            scoreIndexes: scoreIndexes,
            scoreInfos: scoreInfos,
            userJoinedGameIndexes: userJoinedGameIndexes,
            isJoinedGame: isJoinedGame,
            uerJoinedGameScoreIndexes: uerJoinedGameScoreIndexes,
            uerJoinedGameScoreInfos: uerJoinedGameScoreInfos,
            voteInfo: voteInfo,
            userVote: userVote,
            isWin: isWin,
            claimCheck: claimCheck
        };
    }

    async addPlayer(model, onTransactionHash, onConfirmation, onError?) {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        const options = {
            from: await this.web3Service.getFirstAccount()
        };
        sc.methods.setGame(model.awayCourt, model.homeCourt, model.gameType, moment(model.startTime).toDate().getTime())
            .send(options, function (err, transactionHash) {
                if (err) {
                    console.log(err);
                }
            })
            .on('transactionHash', (transactionHash) => {
                if (onTransactionHash) {
                    onTransactionHash(transactionHash);
                }
                console.log(`join txHash: ${transactionHash}`);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {


                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                if (onError) {
                    onError(error);
                }
                console.log(error);
            });
    }

    async  getAllPlayers() {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        const gameIndexes = await sc.methods.getAllGameIndexes().call();

        // 获取所有场次的详细信息
        const gameInfos = [];
        for (const index of gameIndexes) {
            const gameInfo = await sc.methods.getGameInfo(index).call();
            gameInfos.push(gameInfo);
        }

        return gameInfos;
    }

    async delPlayer(model, onTransactionHash, onConfirmation, onError?) {
        const web3 = this.web3Service.instance();
        const key = web3.utils.keccak256(model.arrayCourt + model.homeCourt + model.gameType);
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        const options = {
            from: await this.web3Service.getFirstAccount()
        };
        sc.methods.removeGame(key)
            .send(options, function (err, transactionHash) {
                if (err) {
                    console.log(err);
                }
            })
            .on('transactionHash', (transactionHash) => {
                if (onTransactionHash) {
                    onTransactionHash(transactionHash);
                }
                console.log(`join txHash: ${transactionHash}`);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {


                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                if (onError) {
                    onError(error);
                }
                console.log(error);
            });
    }


    async getRate() {
        const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
        return sc.methods.rate().call();
    }


    async exchange(value, onTransactionHash, onConfirmation) {
        const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
        // const address = await this.web3Service.getAddress('flightDelay');
        // console.log(address);
        const options = {
            from: await this.web3Service.getMainAccount(),
            value: value
        };
        console.log(options);
        // const isAdmin = await sc.methods.admins(model.address).call();
        // const check = await sc.methods.exchangeCheck(value).call();
        // console.log('check:' + check);
        sc.methods.exchange().send(options)
            .on('transactionHash', (transactionHash) => {
                if (onTransactionHash) {
                    onTransactionHash(transactionHash);
                }
                console.log(`exchange txHash: ${transactionHash}`);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
            });
        // const web3 = this.web3Service.instance();
        // return web3.eth.sendTransaction(options)
        //   // return this.sc.methods.query(100).send({from: from})
        //   .on('transactionHash', (transactionHash) => {
        //     console.log(`exchange txHash: ${transactionHash}`);
        //   })
        //   .on('confirmation', (confNumber, receipt) => {
        //     if (onConfirmation) {
        //       onConfirmation(confNumber, receipt);
        //     }
        //   })
        //   .on('error', (error) => {
        //     console.log(error);
        //   });
    }
}
