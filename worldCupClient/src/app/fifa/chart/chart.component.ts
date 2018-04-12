import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

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
    dataSetLabel: string;

    @Input()
    chartType: string;

    @Input()
    chartLabels: string[] = [];

    @Input()
    chartData: number[] = [];

    @Output()
    onHover: EventEmitter<any> = new EventEmitter();

    @Output()
    onClick: EventEmitter<any> = new EventEmitter();

    chart: any;

    constructor(
        private el: ElementRef
    ) { }

    ngOnInit() { }

    ngAfterViewInit() {
        this.generateChart();
    }

    generateChart() {
        this.validateChart();

        const charCtx = this.chartRef.nativeElement.getContext('2d');
        this.chart = new Chart(charCtx, {
            animating: true,
            type: this.chartType,
            data: {
                labels: this.chartLabels,
                datasets: [{
                    label: this.dataSetLabel === undefined ? '' : this.dataSetLabel,
                    data: this.chartData,
                    backgroundColor: this.generateRandomColors(),
                    pointBorderWidth: 10,
                    pointRadius: 8,
                    pointHitRadius: 8,
                    pointHoverRadius: 9
                }]
            },
            options: {
                defaultColor: 'rgba(255, 159, 64, 0.2)',
                title: {
                    fontSize: 22,
                    display: true,
                    text: this.chartTitle
                },
                tooltip: {
                    enabled: true
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
                    this.onHover.emit(event);
                },

                onClick: (event) => {
                    console.log(event);
                    this.onClick.emit(event.target);
                }

            }
        });

        setTimeout(() => {
            this.chart.update();
        }, 1000);
    }


    validateChart() {

        if (!this.chartTitle) {
            console.warn('Your chart does not have a title, use chartTitle input to insert one');
        }


        if (this.chartData.length <= 0) {
            throw Error('Your chart does not have the chatDate property, please insert the chartData to load the chart');
        }

        if (this.chartLabels.length <= 0) {
            throw Error('Your chart does not have the chartLabels property, please insert the chartLabels to load the chart');
        }
    }

    generateRandomColors() {
        const colors: string[] = [];
        for (let index = 0; index < this.chartData.length; index++) {
            const randomColor1 = Math.floor((Math.random() * 255) + 1);
            const randomColor2 = Math.floor((Math.random() * 255) + 1);
            const randomColor3 = Math.floor((Math.random() * 255) + 1);
            const randomColor4 = Math.random() * (1 - 0.1) + 0.1;
            let color = `rgba(${randomColor1.toString()},${randomColor2.toString()},${randomColor3.toString()},${randomColor4.toString()})`;
            colors.push(color);
            color = null;
        }
        return colors;
    }

}
