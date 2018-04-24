import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import * as moment from 'moment';

@Injectable()
export class WCCService {
    constructor(private web3Service: Web3Service, private localStorage: LocalStorage) { }
    // 测试-获取所有信息
    async getAllInfo() {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        // 获取所有已添加的场次信息
        const gameIndexes = await sc.methods.getAllGameIndexes().call();

        // 获取所有场次的详细信息
        const gameInfos = [];
        for (const index of gameIndexes) {
            const gameInfo = await sc.methods.getGameInfo(index).call();
            gameInfos.push(gameInfo);
        }
        // 获取场次的下注信息，这里取第一场
        const gameIndex = gameIndexes[0];
        const scoreIndexes = await sc.methods.getGameScoreIndexes(gameIndex).call();
        // 获取该场次的所有下注详细信息
        const scoreInfos = [];
        for (const scoreIndex of scoreIndexes) {
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
        for (const uerJoinedGameScoreIndex of uerJoinedGameScoreIndexes) {
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
            from: await this.web3Service.getMainAccount()
        };
        sc.methods.setGame(model.awayCourt, model.homeCourt, model.gameType, moment(model.startTime).unix())
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
        console.log('get all player');
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        const gameIndexes = await sc.methods.getAllGameIndexes().call();
        // get all games
        const gameInfos = [];
        for (const index of gameIndexes) {
            const gameInfo = await sc.methods.getGameInfo(index).call();
            gameInfos.push(gameInfo);
        }
        return gameInfos;
    }
    async getAllGameIndexes() {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        return sc.methods.getAllGameIndexes().call();
    }
    async getGameInfo(index) {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        const gameInfo = await sc.methods.getGameInfo(index).call();
        // if (gameInfo.gameType != '0') {
        //     const playerName = await sc.methods.playerNames(index).call();
        //     if (playerName.isValued) {
        //         gameInfo.p1 = playerName.p1;
        //         gameInfo.p2 = playerName.p2;
        //     }
        // }
        return gameInfo;
    }
    async getGameScoreIndexes(gameIndex) {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        return sc.methods.getGameScoreIndexes(gameIndex).call();
    }
    async getGameBetInfo(gameIndex, scoreIndex) {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        return sc.methods.getGameScoreTotalInfo(gameIndex, scoreIndex).call();
    }
    async getGameBetInfos(index) {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        const allBets = await sc.methods.getGameScoreIndexes(index).call();
        console.log(allBets);
        // get bet infos
        const betInfos = [];
        for (let i = 0; i < allBets.length; i++) {
            const bindex = allBets[i];
            const betInfo = await sc.methods.getGameScoreTotalInfo(index, bindex).call();
            betInfos.push(betInfo);
        }
        return {
            allBets: allBets,
            betInfos: betInfos
        };
    }
    async isGameUpdated() {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        const gameUpdateTime = await this.localStorage.getItem<any>('gameUpdateTime').toPromise();
        const fromBlockChain = await sc.methods.gamesUpdated().call();
        console.log(`${gameUpdateTime} +++ ${fromBlockChain}`);
        if (gameUpdateTime !== fromBlockChain) {
            this.localStorage.setItem('gameUpdateTime', fromBlockChain).toPromise();
            return true;
        } else {
            return false;
        }
    }
    getGameIndex(p1, p2, gameType) {
        const web3 = this.web3Service.instance();
        return web3.utils.soliditySha3({ t: 'string', v: p1 }, { t: 'string', v: p2 }, { t: 'uint8', v: gameType });
    }
    async isVoteCanEnd(gameIndex) {
        const sc = await this.web3Service.getContract('wccVoter', 'WccVoter');
        return sc.methods.canEnd(gameIndex).call();
    }
    getScoreIndex(score) {
        const web3 = this.web3Service.instance();
        return web3.utils.keccak256(score);
    }

    async delPlayer(model, onTransactionHash, onConfirmation, onError?) {
        const web3 = this.web3Service.instance();
        const key = this.getGameIndex(model.arrayCourt, model.homeCourt, model.gameType);
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


    // async getRate() {
    //     const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
    //     return sc.methods.rate().call();
    // }
    async exchangeCheck(value) {
        const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
        const msgObj = {
            1: 'too small exchange value',
            2: 'the contract have no enough balance'
        };
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        const checkResult = await sc.methods.exchangeCheck(value).call(options);
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }
    async getBetLimit() {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const limit = await sc.methods.limit().call();
        const web3 = this.web3Service.instance();
        return web3.utils.fromWei(limit);
    }
    async joinCheck(gameIndex, value) {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const msgObj = {
            1: 'game not exist',
            2: 'wrong status',
            3: 'too small chip',
            4: 'contract owner can not bet'
        };
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        const checkResult = await sc.methods.joinCheck(gameIndex, value).call(options);
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }

    async voteCheck(gameIndex) {
        const sc = await this.web3Service.getContract('wccVoter', 'WccVoter');
        const msgObj = {
            1: 'game not exist',
            2: 'wrong status',
            3: 'vote ended',
            4: 'vote not exist',
            5: 'has voted',
            6: 'no vote token',
            7: 'contract owner can not vote'
        };
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        const checkResult = await sc.methods.voteCheck(gameIndex).call(options);
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }

    async claimCheck(gameIndex, scoreIndex) {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const msgObj = {
            1: 'vote not finish',
            2: 'vote not passed',
            3: 'not win',
            4: 'paid'
        };
        const checkResult = await sc.methods.claimCheck(gameIndex, scoreIndex).call();
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }

    async join(gameIndex, score, value, onTransactionHash, onConfirmation, onError?) {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const options = {
            from: await this.web3Service.getMainAccount(),
            value: value
        };
        console.log(options);
        sc.methods.join(gameIndex, score)
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


    async getVoteInfo(gameIndex) {
        const sc = await this.web3Service.getContract('wccVoteStorage', 'WccVoteStorage');
        return sc.methods.voteInfos(gameIndex).call();
    }


    async claim(gameIndex, scoreIndex, onTransactionHash, onConfirmation, onError?) {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        console.log(options);
        sc.methods.claim(gameIndex, scoreIndex)
            .send(options, function (err, transactionHash) {
                if (err) {
                    console.log(err);
                }
            })
            .on('transactionHash', (transactionHash) => {
                if (onTransactionHash) {
                    onTransactionHash(transactionHash);
                }
                console.log(`claim txHash: ${transactionHash}`);
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

    async vote(gameIndex, yesOrNo, onTransactionHash, onConfirmation, onError?) {
        const sc = await this.web3Service.getContract('wccVoter', 'WccVoter');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        console.log(options);
        sc.methods.vote(gameIndex, yesOrNo)
            .send(options, function (err, transactionHash) {
                if (err) {
                    console.log(err);
                }
            })
            .on('transactionHash', (transactionHash) => {
                if (onTransactionHash) {
                    onTransactionHash(transactionHash);
                }
                console.log(`vote txHash: ${transactionHash}`);
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

    async getExchangerInfo() {
        const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
        const exchanged = await sc.methods.exchanged().call();
        const rate = await sc.methods.rate().call();
        const tokenSC = await this.web3Service.getContract('knotToken', 'KnotToken');
        const web3 = this.web3Service.instance();
        const address = await this.web3Service.getAddress('wccExchanger');
        const token = await tokenSC.methods.balanceOf(address).call();
        return {
            rate: rate,
            exchanged: web3.utils.fromWei(exchanged),
            tokenBalance: web3.utils.fromWei(token)
        };
    }
    async exchange(value, onTransactionHash, onConfirmation, onError?) {
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
                if (onError) {
                    onError(error);
                }
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
    async getUserJoinedGameIndexes() {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        return sc.methods.getUserJoinedGameIndexes().call();
    }
    async getUserJoinedGameScoreIndexes(gameIndex) {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        return sc.methods.getUserJoinedGameScoreIndexes(gameIndex).call();
    }
    async getUserJoinedGameScoreInfo(gameIndex, gameInfo, scoreIndex) {
        const sc = await this.web3Service.getContract('wccStorage', 'WccStorage');
        const web3 = this.web3Service.instance();
        const playerSC = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const scoreInfo = await sc.methods.getUserJoinedGameScoreInfo(gameIndex, scoreIndex).call();
        if (gameInfo.status === '3') {
            const isWin = await playerSC.methods.isWin(gameIndex, scoreIndex).call();
            if (isWin.win) {
                scoreInfo.win = web3.utils.fromWei(isWin.value);
            } else {
                scoreInfo.win = 'No';
            }
        } else {
            scoreInfo.win = 'Underway';
        }
        return scoreInfo;
    }
    async isVoterWin(gameIndex) {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        return sc.methods.isVoterWin(gameIndex).call();
    }
    async claimByVoterCheck(gameIndex) {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const msgObj = {
            1: 'vote not finish',
            2: 'vote not passed',
            3: 'not win',
            4: 'already paid'
        };
        const checkResult = await sc.methods.claimByVoterCheck(gameIndex).call();
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }
    async claimByVoter(gameIndex, onConfirmation, onError) {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        console.log(options);
        sc.methods.claimByVoter(gameIndex).send(options)
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
                if (onError) {
                    onError(error);
                }
            });
    }
    async getUserVotedGameIndexes() {
        const sc = await this.web3Service.getContract('wccVoteStorage', 'WccVoteStorage');
        return sc.methods.getUserVotedGameIndex().call();
    }
    async getGameVoteInfo(gameIndex) {
        const sc = await this.web3Service.getContract('wccVoteStorage', 'WccVoteStorage');
        return sc.methods.voteInfos(gameIndex).call();
    }
    async getUserVoteInfo(gameIndex, gameInfo) {
        const web3 = this.web3Service.instance();
        const sc = await this.web3Service.getContract('wccVoteStorage', 'WccVoteStorage');
        const player = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const accout = await await this.web3Service.getMainAccount();
        const voteInfo = await sc.methods.userVotes(gameIndex, accout).call();
        if (gameInfo.status == '3') {
            const isWin = await player.methods.isVoterWin(gameIndex).call();
            if (isWin.win) {
                voteInfo.win = web3.utils.fromWei(isWin.value);
            } else {
                voteInfo.win = 'No';
            }
        } else {
            voteInfo.win = 'Underway';
        }
        return voteInfo;
    }
    async getUserWithdraw() {
        const player = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const account = await this.web3Service.getMainAccount();
        return player.methods.withdraws(account).call();
    }
    async isOwner() {
        const sc = await this.web3Service.getContract('wccVoteStorage', 'WccVoteStorage');
        const owner = await sc.methods.owner().call();
        const account = await this.web3Service.getMainAccount();
        if (owner === account) {
            return true;
        } else {
            return false;
        }
    }

    async startPlayByJudge(gameIndex, onConfirmation, onError) {
        const voter = await this.web3Service.getContract('wccVoter', 'WccVoter');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        voter.methods.setGameStart(gameIndex).send(options)
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
                if (onError) {
                    onError(error);
                }
            });
    }

    async startVoteCheck(gameIndex) {
        const sc = await this.web3Service.getContract('wccVoter', 'WccVoter');
        const msgObj = {
            1: 'game not exist',
            2: 'status error'
        };
        const checkResult = await sc.methods.startVoteCheck(gameIndex).call();
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }
    async startVote(gameIndex, target, onConfirmation, onError) {
        const sc = await this.web3Service.getContract('wccVoter', 'WccVoter');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        sc.methods.startVote(gameIndex, target).send(options)
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
                if (onError) {
                    onError(error);
                }
            });
    }
    async setVoteCanEndCheck(gameIndex) {
        const sc = await this.web3Service.getContract('wccVoter', 'WccVoter');
        const msgObj = {
            1: 'game not exist',
            2: 'status error',
            3: 'vote ended',
            4: 'vote not exist'
        };
        const checkResult = await sc.methods.canEndCheck(gameIndex).call();
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }
    async setVoteCanEnd(gameIndex, onConfirmation, onError) {
        const sc = await this.web3Service.getContract('wccVoter', 'WccVoter');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        sc.methods.setCanEnd(gameIndex).send(options)
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
                if (onError) {
                    onError(error);
                }
            });
    }
    async withdrawCheck() {
        const account = await this.web3Service.getMainAccount();
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const msgObj = {
            1: 'no withdraw balance',
            2: 'contract no enough balance',
            3: 'owner can not withdraw',
            4: 'owner no enough balance'
        };
        const checkResult = await sc.methods.withdrawCheck(account).call();
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }
    async withdraw(onConfirmation, onError) {
        const sc = await this.web3Service.getContract('wccPlayer', 'WccPlayer');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        console.log(options);
        sc.methods.withdraw().send(options)
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
                if (onError) {
                    onError(error);
                }
            });
    }
    async redeemCheck(value) {
        const account = await this.web3Service.getMainAccount();
        const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
        const msgObj = {
            1: 'too small value',
            2: 'no token allowance'
        };
        const checkResult = await sc.methods.redeemCheck(value).call();
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }
    async redeem(value, onConfirmation, onError) {
        const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        sc.methods.redeem(value).send(options)
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
                if (onError) {
                    onError(error);
                }
            });
    }
    async exchangerWithdrawBalance() {
        const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
        const account = await this.web3Service.getMainAccount();
        return sc.methods.withdraws(account).call();
    }
    async exchangerWithdraw(onConfirmation, onError) {
        const sc = await this.web3Service.getContract('wccExchanger', 'WccExchanger');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        sc.methods.withdraw().send(options)
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
                if (onError) {
                    onError(error);
                }
            });
    }
}
