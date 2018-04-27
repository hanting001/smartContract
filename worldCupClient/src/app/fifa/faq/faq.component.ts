import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
    constructor(private sanitizer: DomSanitizer) { }
    faqs: any[];
    abouts: any[];
    ngOnInit() {
        this.faqs = [
            {
                question: 'What do I need to play this game?',
                title: 'Here’s what you need to get started:', answers: [
                    'A computer or laptop running the desktop version of Chrome or Brave browser',
                    '<span class="text-primary">MetaMask</span>, a digital wallet used specifically with web apps',
                    '<span class="text-primary">Ether</span>, a form of digital payment that powers this game'
                ]
            }, {
                question: 'Installing MetaMask, your digital wallet',
                title: 'To use this game, you will need to install MetaMask, a digital wallet. You will need to put money in it to make your first purchase.',
                answers: [
                    '<strong>Note:</strong> A digital wallet like MetaMask acts like a bank account—treat it with respect and make sure you don’t forget your password or the seed words.'
                ],
                other: this.sanitizer.bypassSecurityTrustHtml(`<iframe width="787" height="315" src="https://www.youtube.com/embed/tfETpi-9ORs" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`)
            }, {
                question: 'Why is MetaMask locked?',
                title: 'Occasionally the ‘Home’ page displays a lock screen. This happens because MetaMask automatically locks your account after a certain period of time. To unlock simply click on the MetaMask extension and type in your password.',
                answers: [],
                other: '<img class="img-fluid" src="assets/images/screenshot-locked.png">'
            }, {
                question: 'Reinstalling MetaMask',
                title: 'Some users need to uninstall and reinstall MetaMask because they’ve experienced a bug. If you kept your seed words, this is very easy! Just delete the extension, reinstall it, and import your twelve seed words. Then you’ll set the password you want to use (this can be the same one you used before or a whole new password).',
                answers: [
                ]
            }, {
                question: 'Getting Ether, your digital currency',
                title: '',
                answers: [
                    'For U.S. citizens only: you can buy ether (ETH) in MetaMask. ETH is a digital currency that enables our game to run.',
                    'For everyone else: you will need to purchase ETH from an exchange, and then transfer the ETH from your exchange wallet to your MetaMask wallet. Unfortunately, you cannot play this game with only an exchange account.'
                ],
                other: '<img class="img-fluid" src="assets/images/screenshot-buy-usa.png">'
            }, {
                question: 'How to send ETH to MetaMask',
                title: '', answers: [
                    'For U.S. citizens only: you are able to purchase ETH directly from the MetaMask wallet using the Coinbase widget. This is more convenient and doesn’t require you to create two accounts.',
                    'For everyone else: you need to buy ETH from an exchange using normal fiat currency. Copy your MetaMask address by clicking on the large ‘...’ next to your account, then select ‘Copy Address to clipboard’. Go to your exchange, click ‘Accounts’, and select your ETH Wallet and click ‘send’. Paste the MetaMask address in the box with the amount you’d like to transfer.'
                ],
                other: this.sanitizer.bypassSecurityTrustHtml('<iframe width="787" height="315" src="https://www.youtube.com/embed/PtdMDtCVck0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>')
            }
        ];
        this.abouts = [
            {
                question: 'How do I win ETH?',
                title: 'There are two ways to win ETH in the game',
                answers: [
                    'By predicting the score of the game, if the score is guessed, all the people who guessed the score <span class="text-primary">share the total amount of the entire bet</span>.',
                    'By voting on the results of the contest, if the vote is passed, all those who voted in favor <span class="text-primary">share the 5% of entire bet</span>'
                ]
            }, {
                question: 'Do I need to signup?',
                title: 'Nope. No signups are necessary! We will never ask you for any personal information and all betting can be done anonymously.',
                answers: []
            }, {
                question: 'What is the rules for calculating bonuses?',
                title: 'The rules for calculating bonuses are very simple. The more you invest, the more ETHs are won.',
                answers: [
                    'For betting players, the proportion of your bet in all winners multiplied by the total size of the game',
                    'For the voting player, the percentage of the total balance of all the winners that you have held in the voting token is multiplied by 5% of the total game\'s bets.'
                ]
            }, {
                question: 'How to bet?',
                title: 'Bets related to the state of the game',
                answers: [
                    'The match can only bet if it is not start to play',
                    'The minimum bet is 0.01ETH',
                    'Need to submit scores and amounts when betting',
                    'You can bet multiple times on the same match'
                ],
                other: '<img class="img-fluid" src="assets/images/screenshot1.png">'
            }, {
                question: 'How to determine the weight of the vote?',
                title: '',
                answers: [
                    'The weight of the vote is determined by the balance of the voting token you have. The more tokens you have, the greater the weight is.'
                ]
            }, {
                question: 'How do I receive the bonus?',
                title: 'For security reasons, getting a bonus requires two steps',
                answers: [
                    'If you win, you can go to the transactions menu to see the winning amount, click on the claim button, the bonus amount will be transferred to your withdraw balance',
                    'Under my balance, you can transfer eth within the withdraw balance to your wallet address once',
                    'When transferring from ETH with withindraw balance, the contract will deduct 10% of the processing fee, so the ETH actually transferred to your wallet may be slightly less than the prize amount.'
                ],
                other: '<img class="img-fluid" src="assets/images/screenshot2.png">'
            }, {
                question: '下注时的赔率是如何确定的?',
                title: '',
                answers: [
                    '赔率有总盘的大小和你下注的大小决定，计算公式为（你的下注额占该比分下注总额乘以该比赛的总下注额）',
                    '赔率是一个动态变化的值，下注集中度越高的比分往往其赔率也越低'
                ]
            }, {
                question: '什么是withdraw账户余额?',
                title: '',
                answers: [
                    '赔率有总盘的大小和你下注的大小决定，计算公式为（你的下注额占该比分下注总额乘以该比赛的总下注额）',
                    '赔率是一个动态变化的值，下注集中度越高的比分往往其赔率也越低'
                ]
            }, {
                question: '为什么有时候比赛信息显示的这么慢?',
                title: '由于我们已经将所有的比赛数据都录入到了区块链上，所以从区块链上查询的过程是比较慢的。不过这个缓慢的过程肯能只需要经历一次，因为web页面之后会缓存所有的比赛信息',
                answers: []
            }
        ];
    }

}
