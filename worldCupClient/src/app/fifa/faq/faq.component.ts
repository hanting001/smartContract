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
                    'MetaMask, a digital wallet used specifically with web apps',
                    'Ether, a form of digital payment that powers this game'
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
                other: this.sanitizer.bypassSecurityTrustHtml('<iframe width="787" height="315" src="https://www.youtube.com/embed/PtdMDtCVck0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
            }
        ];
        this.abouts = [
            {
                question: '我如何赢取ETH?',
                title: '游戏中有两种途径可以赢取ETH:',
                answers: [
                    '通过预测比赛的比分下注，如果猜中了比分，所有猜中比分的人共享整个下注盘的总额',
                    '通过对比赛的结果进行投票，如果投票通过，所有投赞成票的人共享整个下注盘的5%'
                ]
            }, {
                question: '奖金的计算规则',
                title: '奖金的计算规则非常简单，你投入越多，赢取的ETH也就越多',
                answers: [
                    '对于下注,你的下注额在所有赢家中的占比乘以该场比赛总盘面大小',
                    '对于投票,你的投票币的余额在所有赢家总余额的占比乘以该场比赛总盘面的5%'
                ],
                other: this.sanitizer.bypassSecurityTrustHtml(`<iframe width="787" height="315" src="https://www.youtube.com/embed/tfETpi-9ORs" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`)
            }, {
                question: '如何下注?',
                title: '下注跟比赛的状态有关',
                answers: [
                    '比赛只有在未开赛的状态下才可以下注',
                    '下注最小额度是0.01ETH',
                    '下注时需要报上你竞猜的比分和下注额度',
                    '一场比赛可以多次下注'
                ],
                other: '<img class="img-fluid" src="assets/images/screenshot-locked.png">'
            }, {
                question: '投票的权重如何确定?',
                title: '',
                answers: [
                    '投票的权重有你所拥有的投票token的余额决定，拥有的token越多，权重也越大'
                ]
            }, {
                question: '我如何领取奖金?',
                title: '领取奖金需要两个步骤',
                answers: [
                    '如果你赢了下注或者投票，可以到交易菜单下查看赢取金额，点击领取按钮，奖金金额将转到你的withdraw余额内',
                    '你可以将withdraw余额内的eth一次性转到自己的钱包地址内',
                    '领取奖金时，合约会扣取10%的手续费，所以实际转到你钱包内的ETH可能会比奖金额略少'
                ],
                other: '<img class="img-fluid" src="assets/images/screenshot-buy-usa.png">'
            }, {
                question: '下注时的赔率是如何确定的?',
                title: '',
                answers: [
                    '赔率有总盘的大小和你下注的大小决定，计算公式为（你的下注额占该比分下注总额乘以该比赛的总下注额）',
                    '赔率是一个动态变化的值，下注集中度越高的比分往往其赔率也越低'
                ]
            }, {
                question: '为什么比赛信息显示的这么慢?',
                title: '由于我们已经将所有的比赛都录入到了区块链上，所以从区块链上查询的过程是比较慢的。不过这个缓慢的过程肯能只需要经历一次，因为web页面之后会缓存所有的比赛信息',
                answers: []
            }
        ];
    }

}
