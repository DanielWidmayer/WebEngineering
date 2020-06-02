$(document).ready(function () {
    var apiKey = '7JU1V7BVM8RVBNQZ';
    var timeSeries = 'TIME_SERIES_WEEKLY';
    var symbol = 'IBM';
    var stockDates = [],
        stockOpen = [],
        stockHigh = [],
        stockLow = [],
        stockClose = [];

    $.ajax({
        url: 'https://www.alphavantage.co/query?function=' + timeSeries + '&symbol=' + symbol + '&apikey=' + apiKey,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var stockLabel = data['Meta Data']['2. Symbol'];
            data = data['Weekly Time Series'];
            for (var i in data) {
                stockDates.unshift(i);
                console.log(i + JSON.stringify(data[i]));
                counter = 0;
                for (const key in data[i]) {
                    if (data[i].hasOwnProperty(key)) {
                        if (key.includes('open')) {
                            stockOpen.push(data[i][key]);
                        } else if (key.includes('high')) {
                            stockHigh.push(data[i][key]);
                        } else if (key.includes('low')) {
                            stockLow.push(data[i][key]);
                        } else if (key.includes('close')) {
                            stockClose.push(data[i][key]);
                        }
                    }
                }
            }

            var stockCanvas = document.getElementById('stockCanvas');
            var lineChart = new Chart(stockCanvas, {
                type: 'line',
                data: {
                    labels: stockDates,
                    datasets: [
                        {
                            label: stockLabel,
                            lineTension: 0,
                            backgroundColor: '#3a3b4570',
                            borderColor: '#e90000',
                            pointRadius: 0,
                            pointHoverRadius: 3,
                            pointHoverBorderColor: '#FFF',
                            pointHitRadius: 5,
                            pointHoverBorderWidth: 2,
                            data: stockOpen,
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: true,
                    layout: {
                        padding: 10,
                    },
                    scales: {
                        xAxes: [
                            {
                                time: {
                                    unit: 'date',
                                },
                                gridLines: {
                                    display: false,
                                    drawBorder: false,
                                },
                                ticks: {
                                    fontColor: '#FFF',
                                },
                            },
                        ],
                        yAxes: [
                            {
                                ticks: {
                                    maxTicksLimit: 10,
                                    padding: 10,
                                    fontColor: '#FFF',
                                },
                            },
                        ],
                    },
                    legend: {
                        display: true,
                    },
                },
            });
        },
        error: function (request, error) {
            console.log(error + 'Request:' + JSON.stringify(request));
        },
    });
});
