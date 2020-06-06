var currentCompany = 'IBM'; // default chart
var stockChart; // global object
var companies; // JSON struct for data
$(document).ready(function () {
    console.log();
    try {
        companies = JSON.parse(localStorage.getItem('chartData'));
        if (Object.keys(companies.DDAIF).length > 0) {
            activateButtons();
            createDefaultChart();
        } else {
            getChartData();
        }
    } catch (err) {
        getChartData();
    }
});

function getChartData() {
    companies = { IBM: {}, AAPL: {}, DDAIF: {} };
    for (const symbol in companies) {
        // define vars
        var apiKey = '7JU1V7BVM8RVBNQZ'; // own alpha vantage API key
        var timeSeries = 'TIME_SERIES_WEEKLY';
        var ajaxCounter = 0;
        $.ajax({
            url: 'https://www.alphavantage.co/query?function=' + timeSeries + '&symbol=' + symbol + '&apikey=' + apiKey, // build url for alpha vantage query
            type: 'GET', // GET since we want information from the API
            dataType: 'json',
            success: function (data) {
                var stockDates = [], // use arrays to store wanted data
                    stockOpen = [],
                    stockHigh = [],
                    stockLow = [],
                    stockClose = [];
                //stockLabel = symbol;
                data = data['Weekly Time Series'];
                for (var i in data) {
                    stockDates.unshift(i);
                    for (const key in data[i]) {
                        if (data[i].hasOwnProperty(key)) {
                            if (key.includes('open')) {
                                stockOpen.unshift(data[i][key]);
                            } else if (key.includes('high')) {
                                stockHigh.unshift(data[i][key]);
                            } else if (key.includes('low')) {
                                stockLow.unshift(data[i][key]);
                            } else if (key.includes('close')) {
                                stockClose.unshift(data[i][key]);
                            }
                        }
                    }
                }
                // build JSON object from data
                companies[symbol] = { stockDates: stockDates, stockOpen: stockOpen, stockHigh: stockHigh, stockLow: stockLow, stockClose: stockClose };
                if (symbol == 'IBM') {
                    createDefaultChart();
                }
            },
            error: function (request, error) {
                console.log(error + 'Request:' + JSON.stringify(request));
            },
        }).then(function () {
            ajaxCounter++;
            if (ajaxCounter == 3) {
                localStorage.setItem('chartData', JSON.stringify(companies));
                activateButtons();
            }
        });
    }
}

function createDefaultChart() {
    var stockCanvas = document.getElementById('stockCanvas');
    // prettier-ignore
    var chartConfig = { //configure chart 
                        type: 'line',     // use linechart
                        data: { 
                            labels: companies[currentCompany]['stockDates'], 
                            datasets: [ // default dataset
                                {
                                    label: currentCompany + ' stockOpen',
                                    lineTension: 0,
                                    backgroundColor: '#e9000020',
                                    borderColor: '#e90000',
                                    pointRadius: 0,
                                    pointHoverRadius: 3,
                                    pointHoverBorderColor: '#FFF',
                                    pointHitRadius: 5,
                                    pointHoverBorderWidth: 2,
                                    data: companies[currentCompany]['stockOpen'],
                                }
                            ],
                        },    // labels is used for time x axis, data is being loaded dynamically
                        options: {
                            maintainAspectRatio: true,  // used for responsiveness
                            aspectRatio: 1.5,
                            layout: { padding: 10, },
                            scales: {
                                xAxes: [
                                    {
                                    time: { unit: 'date', }, //custom styling
                                    gridLines: {
                                    display: false,
                                   drawBorder: false,
                                   },
                                  ticks: { fontColor: '#FFF', },
                                  },
                               ],
                               yAxes: [ { ticks: { fontColor: '#FFF', }, }, ],
                            },
                            legend: { display: true, },
                        },
                    };
    // create the Chart with the default config
    stockChart = new Chart(stockCanvas, chartConfig);
}

function activateButtons() {
    for (const key in companies) {
        $('#stock' + key).click(function () {
            currentCompany = key;
            stockChart.config.data.datasets = [];
            stockChart.config.data.datasets.push({
                label: currentCompany + ' stockOpen',
                lineTension: 0,
                backgroundColor: '#e9000020',
                borderColor: '#e90000',
                pointRadius: 0,
                pointHoverRadius: 3,
                pointHoverBorderColor: '#FFF',
                pointHitRadius: 5,
                pointHoverBorderWidth: 2,
                data: companies[currentCompany]['stockOpen'],
            });
            stockChart.update();
            resetCheckboxes();
        });
    }
    for (const key in companies[currentCompany]) {
        if (key != 'stockDates') {
            var colors = { stockOpen: '#e90000', stockClose: '#EF44A7', stockHigh: '#A322C7', stockLow: '#3B1F87' };
            $('#' + key + 'Checkbox').click(function (el) {
                if ($('#' + key + 'Checkbox').is(':checked')) {
                    var chartData = stockChart.config.data;
                    chartData.datasets.push({
                        label: currentCompany + ' ' + key,
                        lineTension: 0,
                        backgroundColor: colors[key] + '20',
                        borderColor: colors[key],
                        pointRadius: 0,
                        pointHoverRadius: 3,
                        pointHoverBorderColor: '#FFF',
                        pointHitRadius: 5,
                        pointHoverBorderWidth: 2,
                        data: companies[currentCompany][key],
                    });
                } else {
                    var chartData = stockChart.config.data;
                    chartData.datasets.splice(getChartDataIndex(chartData.datasets, key), 1);
                }
                stockChart.update();
            });
        }
    }
}

function getChartDataIndex(dataset, key) {
    for (let index = 0; index < dataset.length; index++) {
        if (dataset[index].label.includes(key)) {
            return index;
        }
    }
    return -1;
}

function resetCheckboxes() {
    $('#stockOpenCheckbox').prop('checked', true);
    $('#stockCloseCheckbox').prop('checked', false);
    $('#stockHighCheckbox').prop('checked', false);
    $('#stockLowCheckbox').prop('checked', false);
}
