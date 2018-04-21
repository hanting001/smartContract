import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
    faqs: any[] = [
        {
            question: 'What do I need to play?',
            title: 'Here’s what you need to get started:', answers: [
                'A computer or laptop running the desktop version of Chrome or Firefox',
                'MetaMask, a digital wallet used specifically with web apps'
            ]
        }, {
            question: 'Installing MetaMask, your digital wallet',
            title: 'To use CryptoKitties, you will need to install MetaMask, a digital wallet. You will need to put money in it to make your first purchase.', answers: [
                'Note: A digital wallet like MetaMask acts like a bank account—treat it with respect and make sure you don’t forget your password or the seed words.'
            ]
        }, {
            question: 'Reinstalling MetaMask',
            title: 'Some users need to uninstall and reinstall MetaMask because they’ve experienced a bug. If you kept your seed words, this is very easy! Just delete the extension, reinstall it, and import your twelve seed words. Then you’ll set the password you want to use (this can be the same one you used before or a whole new password), and confirm your email address and username again on the CryptoKitties website.', answers: [
            ]
        }, {
            question: 'Getting Ether, your digital currency',
            title: '', answers: [
                'For U.S. citizens only: you can buy ether (ETH) in MetaMask. ETH is a digital currency that enables our game to run.',
                'For everyone else: you will need to purchase ETH from an exchange, and then transfer the ETH from your exchange wallet to your MetaMask wallet. Unfortunately, you cannot play CryptoKitties with only an exchange account.',
                'You cannot use USD/CAD to bet—currencies need to be converted into ETH first.'
            ]
        }, {
            question: 'How to send ETH to MetaMask',
            title: '', answers: [
                'For U.S. citizens only: you are able to purchase ETH directly from the MetaMask wallet using the Coinbase widget. This is more convenient and doesn’t require you to create two accounts.',
                'For everyone else: you need to buy ETH from an exchange using normal fiat currency. Copy your MetaMask address by clicking on the large ‘...’ next to your account, then select ‘Copy Address to clipboard’. Go to your exchange, click ‘Accounts’, and select your ETH Wallet and click ‘send’. Paste the MetaMask address in the box with the amount you’d like to transfer.',
                'You cannot use USD/CAD to bet—currencies need to be converted into ETH first.'
            ]
        }
    ];

    constructor() { }

    ngOnInit() {
    }

}
