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
    chartOtherInfo: any;

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
    labelColors: string[];


    constructor(
        private el: ElementRef
    ) { }

    ngOnInit() { }

    ngAfterViewInit() {
        this.generateChart();
    }

    customTooltips(tooltip) {
        console.log(this.chartOtherInfo);
        console.log(tooltip);
        // Tooltip Element
        let tooltipEl = document.getElementById('chartjs-tooltip');

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            // this.chartRef.nativeElement.
            document.getElementsByTagName('canvas')[0].parentNode.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
        }

        // Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltip.yAlign) {
            tooltipEl.classList.add(tooltip.yAlign);
        } else {
            tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
            return bodyItem.lines;
        }

        // Set Text
        if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map(getBody);

            let innerHtml = '<thead>';
            console.log(tooltip.title);
            titleLines.forEach(function (title) {
                innerHtml += '<tr><th>' + title + '</th></tr>';
            });
            innerHtml += '</thead><tbody>';

            bodyLines.forEach((body, i) => {
                const colors = tooltip.labelColors[i];
                let style = 'background:' + colors.backgroundColor;
                style += '; border-color:' + colors.borderColor;
                style += '; border-width: 2px';
                const span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                innerHtml += '<tr><td>' + span + body + '</td></tr>';
            });

            const span2 = '<span class="chartjs-tooltip-key" style="border-width: 2px"></span>';
            innerHtml += '<tr><td>' + span2 + 'Odds: ' + this.chartOtherInfo[tooltip.title].odd + '</td></tr>';
            innerHtml += '<tr><td>' + span2 + 'Counts: ' + this.chartOtherInfo[tooltip.title].count + '</td></tr>';
            innerHtml += '</tbody>';

            const tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
        }

        const positionY = document.getElementsByTagName('canvas')[0].offsetTop;
        const positionX = document.getElementsByTagName('canvas')[0].offsetLeft;
        console.log(positionX);
        console.log(positionY);

        // Display, position, and set styles for font
        tooltipEl.style.opacity = '1';
        tooltipEl.style.left = positionX + tooltip.caretX + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
        tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
        tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
        tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
    }

    generateChart() {
        this.validateChart();

        const charCtx = this.chartRef.nativeElement.getContext('2d');
        const tmpColor = this.generateRandomColor();
        this.chart = new Chart(charCtx, {
            type: this.chartType,
            data: {
                labels: this.chartLabels,
                datasets: [{
                    label: this.dataSetLabel === undefined ? '' : this.dataSetLabel,
                    data: this.chartData,
                    borderColor: tmpColor,
                    pointBackgroundColor: tmpColor,
                    fill: false,
                    pointBorderWidth: 10,
                    pointRadius: 8,
                    pointHitRadius: 8,
                    pointHoverRadius: 9
                }]
            },
            options: {
                responsive: true,
                defaultColor: 'rgba(255, 159, 64, 0.2)',
                title: {
                    fontSize: 22,
                    display: true,
                    text: this.chartTitle
                },
                tooltips: {
                    enabled: false,
                    position: 'nearest',
                    mode: 'index',
                    custom: (tooltip) => {
                        this.customTooltips(tooltip);
                    }
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
                }, scales: {
                    yAxes: [{
                        ticks: {
                            min: 0
                        }
                    }]
                }


            }
        });

        // setTimeout(() => {
        //     this.chart.update();
        // }, 1000);
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
        this.labelColors = colors;
        return colors;
    }
    generateRandomColor() {
        const randomColor1 = Math.floor((Math.random() * 255) + 1);
        const randomColor2 = Math.floor((Math.random() * 255) + 1);
        const randomColor3 = Math.floor((Math.random() * 255) + 1);
        const randomColor4 = Math.random() * (1 - 0.1) + 0.1;
        const color = `rgba(${randomColor1.toString()},${randomColor2.toString()},${randomColor3.toString()},${randomColor4.toString()})`;
        return color;
    }

}
