import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { WCCService, Web3Service } from '../../service/index';
@Component({
    selector: 'chartjs-component',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit {

    @ViewChild('chart')
    chartRef: ElementRef;

    @Input()
    chartId: string;

    @Input()
    chartTitle: string;

    @Input()
    dataSetLabel: any;

    @Input()
    chartOtherInfo: any;

    @Input()
    chartType: string;

    @Input()
    chartLabels: string[] = [];

    @Input()
    chartData;

    @Output()
    hover: EventEmitter<any> = new EventEmitter();

    @Output()
    click: EventEmitter<any> = new EventEmitter();

    @Output()
    getData: EventEmitter<any> = new EventEmitter();

    chart: any;
    labelColors: string[];
    loadingProgress: Number = 0;
    constructor(
        private el: ElementRef,
        private wccService: WCCService,
        private web3Service: Web3Service
    ) { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.generateChart();
    }
    async generateChart() {
        const gameInfo = this.chartData.currentGameInfo;
        const gameIndex = this.chartData.currentGameIndex;
        // this.validateChart(gameInfo);
        if (gameInfo.status == 0 || gameInfo.status == 1) {
            // get bets info
            await this.getBetsInfo(gameInfo, gameIndex);
            this.betChart();
        } else if (gameInfo.status == 2) {
            this.pieChart();
        }
    }
    pieChart() {
        const charCtx = this.chartRef.nativeElement.getContext('2d');
        console.log(this.chartData);
        this.chart = new Chart(charCtx, {
            type: 'pie',
            data: {
                datasets: [{
                    data: this.chartData.data,
                    backgroundColor: ['#006600', '#CC0000']
                }],
                labels: this.chartData.labels
            },
            options: {
                responsive: true
            }
        });
    }
    async getBetsInfo(gameInfo, gameIndex) {
        const scoreIndexes = await this.wccService.getGameScoreIndexes(gameIndex);
        const indexLength = scoreIndexes.length;
        let betInfos = [];
        for (let i = 0; i < indexLength; i++) {
            const betInfo = await this.wccService.getGameBetInfo(gameIndex, scoreIndexes[i]);
            betInfos.push(betInfo);
            this.loadingProgress = Number((betInfos.length / indexLength).toFixed(2)) * 100;
        }
        this.getData.emit(betInfos);
        const sortScore = function (a, b) {
            const scoreA = a.score.replace(/>10/g, '11');
            const scoreB = b.score.replace(/>10/g, '11');
            const tmpAryA = scoreA.split(':');
            const tmpAryB = scoreB.split(':');
            if (tmpAryA[0] == tmpAryB[0]) {
                return tmpAryA[1] - tmpAryB[1];
            } else {
                return tmpAryA[0] - tmpAryB[0];
            }
        };
        betInfos = betInfos.sort(sortScore);
        const web3 = this.web3Service.instance();
        this.chartLabels = [];
        const totalValue = web3.utils.fromWei(gameInfo.totalValue);
        const valueData = [];
        const oddsData = [];
        const betsData = [];
        const betsLen = betInfos.length;
        for (let i = 0; i < betsLen; i++) {
            const tmpValue = web3.utils.fromWei(betInfos[i].totalValue);
            this.chartLabels.push(betInfos[i].score);
            valueData.push(tmpValue);
            oddsData.push((totalValue / tmpValue).toFixed(2));
            betsData.push(betInfos[i].totalBets);
        }
        this.chartData = {
            valueData: valueData,
            oddsData: oddsData,
            betsData: betsData
        };
        this.loadingProgress = 0;
    }
    betChart() {
        const charCtx = this.chartRef.nativeElement.getContext('2d');
        const scoreColor = 'rgb(51, 51, 255)';
        const oddsColor = 'rgb(255, 0, 0)';
        const betsCountColor = 'rgb(102, 102, 102)';
        this.chart = new Chart(charCtx, {
            type: this.chartType,
            data: {
                labels: this.chartLabels,
                datasets: [{
                    label: this.dataSetLabel.valueData,
                    data: this.chartData.valueData,
                    borderColor: scoreColor,
                    backgroundColor: scoreColor,
                    pointBackgroundColor: scoreColor,
                    fill: false,
                    yAxisID: 'y-axis-1',
                    borderWidth: 1
                },
                {
                    label: this.dataSetLabel.oddsData,
                    data: this.chartData.oddsData,
                    borderColor: oddsColor,
                    backgroundColor: oddsColor,
                    pointBackgroundColor: oddsColor,
                    fill: false,
                    yAxisID: 'y-axis-2',
                    borderWidth: 1
                },
                {
                    label: this.dataSetLabel.betsData,
                    data: this.chartData.betsData,
                    borderColor: betsCountColor,
                    backgroundColor: betsCountColor,
                    pointBackgroundColor: betsCountColor,
                    fill: false,
                    yAxisID: 'y-axis-3',
                    borderWidth: 1,
                    borderDash: [5, 5]
                }
                ]
            },
            options: {
                responsive: true,
                defaultColor: 'rgba(255, 159, 64, 0.2)',
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: true,
                    labels: {
                        // fontColor: 'rgb(255, 99, 132)'
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutBounce'
                },

                onHover: (event) => {
                    this.hover.emit(event);
                },
                onClick: (event) => {
                    console.log(event);
                    this.click.emit(event.target);
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Score'
                        }
                    }],
                    yAxes: [{
                        type: 'linear',
                        display: true,
                        position: 'left',
                        id: 'y-axis-1',
                        scaleLabel: {
                            display: true,
                            labelString: 'ETH Value',
                            fontColor: scoreColor
                        },
                        ticks: {
                            fontColor: scoreColor
                        }
                    }, {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        id: 'y-axis-2',
                        scaleLabel: {
                            display: true,
                            labelString: 'Odds',
                            fontColor: oddsColor
                        },
                        ticks: {
                            fontColor: oddsColor
                        },
                        gridLines: {
                            display: false
                        }
                    },
                    {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        id: 'y-axis-3',
                        scaleLabel: {
                            display: true,
                            labelString: 'Bet Count',
                            fontColor: betsCountColor
                        },
                        ticks: {
                            fontColor: betsCountColor
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                }


            }
        });

    }

    // validateChart(gameInfo) {
    // }

}
