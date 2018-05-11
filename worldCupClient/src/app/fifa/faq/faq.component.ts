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
                question: 'How to win ETH?',
                title: 'There are two ways to win ETH in the game.',
                answers: [
                    'By predicting the score of the match. If your bet score is guessed right, you are win. All the winner will <span class="text-primary">share the total amount of the entire bets value</span>.',
                    'By voting on the results of the match, if the vote is passed, all those who voted in favor will <span class="text-primary">share the 5% of entire bets</span>.',
                    '<span class="text-primary">Only 90 minutes</span> of match(first half and second half) outcome as final score, excludes extra time and penalty shootout.'
                ]
            }, {
                question: 'Do you need to signup?',
                title: 'Nope. No signups are necessary! We will never ask you for any personal information and all betting can be done anonymously.',
                answers: []
            }, {
                question: 'Why transaction is pending?',
                title: 'You can read this <a href="https://medium.com/metamask/regarding-pending-transactions-4ec0ec23140d">article</a> to understand why ethereum transaction is sometimes pending and what you can do.',
                answers: []
            }, {
                question: 'What are the rules in bonus calculation?',
                title: 'The rules in bonus calculation are very simple. The more you invest, the more ETHs you will win.',
                answers: [
                    'For the betting players, the bonus = the proportion of your bet in all the winners * the total betting value of the game.',
                    'For the voting player, the bonus = the proportion of token balance you hold in total balance of all the winners * 5% of the total game\'s bets.'
                ]
            }, {
                question: 'How to bet?',
                title: 'Select a match you want to wager on. Take note of details like the Smart Contract Value and minimum buy-in price. Click on your match and you’ll be taken to the modal page where you can make your predictions and wager amount.',
                answers: [
                    'You can bet only before the match starts.',
                    'The minimum bet is 0.01ETH',
                    'You can bet multiple times on the same match.'
                ],
                other: '<img class="img-fluid" src="assets/images/screenshot1.png">'
            }, {
                question: 'How to determine the weight of the vote?',
                title: '',
                answers: [
                    'The weight of the vote is determined by the balance of the token you hold. The more tokens you have, the larger weight it will be.'
                ]
            }, {
                question: 'How to receive the prize?',
                title: 'For security reasons, receiving a prize requires two steps:',
                answers: [
                    'Step One, If you win, you can go to the transactions menu to see the prize, click on the “claim” button, the prize amount will be transferred to your withdraw balance.',
                    'Step Two, On “my balance” tab page, you can transfer ETH within the withdrawal balance to your wallet address at once.',
                    'When withdrawing ETH, the smart contract will deduct 15% of the processing fee, so the ETH received will be less than the prize amount.',
                    'The prize can be collected only within <span class="text-primary">90 days</span> after the end of voting.'
                ],
                other: '<img class="img-fluid" src="assets/images/screenshot2.png">'
            }, {
                question: 'Why ETHSB takes 15% of the total prize?',
                title: 'Remember that the voter will take 5% as their rewards. Likewise, Our team developed program, and support game running, so we will take 10% as rewards.',
                answers: [
                ],
                other: ''
            }, {
                question: 'How the odds are determined?',
                title: '',
                answers: [
                    'The odds are related to the prize pool, and the proportion of your bet in all the winners.',
                    'The odds are a dynamic variable. A higher concentration ratio will cause lower odds.'
                ]
            }, {
                question: 'Why is the match information displayed slowly sometimes?',
                title: 'Since we entered all the game data into the blockchain, the process of querying is relatively slow. However, this slow process will occur only once because the web page will cache all game data later.',
                answers: []
            }, {
                question: 'Why voting?',
                title: 'Since the outcome of the game is a fait accompli, why do we still need to vote to decide who is the winner?',
                answers: [
                    'We want to make the game as fair as possible.',
                    'No one can control the game to decide who is the winner.'
                ]
            }
        ];
    }

}
