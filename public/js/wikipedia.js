$('#wikipediaQueryButton').click(function () {
    $('#wikipediaQueryForm').submit();
});
$('#wikipediaQueryForm').submit(function () {
    var searchKey = $('#wikipediaQueryText').get(0).value;
    if (searchKey == '') {
        if (!alert('Enter something to search for.')) {
            return false;
        }
    } else {
        var searchUrl = 'http://localhost:6001/proxy/?https://de.wikipedia.org/w/api.php?action=query&generator=prefixsearch&format=json&gpslimit=4&prop=extracts%7Cdescription&exintro=1&explaintext=1&exsentences=3&redirects=1&gpssearch=' + searchKey;
        $.ajax({
            url: searchUrl,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.response.query === undefined) {
                    if (!alert('Wikipedia could not find a result for your entry.')) {
                        return false;
                    }
                } else {
                    $('#wikipediaQueryModal').modal('toggle');
                    evaluateWikipediaData(data);
                }
            },
            error: function (request, error) {
                if (!alert(error + ' failed with Request: ' + JSON.stringify(request))) {
                    return false;
                }
            },
        });
        return false;
    }
});

var dataObject = {};

function evaluateWikipediaData(data) {
    let wikipediaDataRow = '<tbody id="wikipediaQueryTable">';
    Object.values(data.response.query.pages).forEach((element) => {
        var wikipediaArticleLink = 'https://de.wikipedia.org/?curid=',
            counter = 0,
            pageid;
        for (var i in element) {
            if (i == 'pageid') {
                pageid = element[i];
                wikipediaArticleLink += element[i];
            } else if (i == 'title') {
                dataObject[pageid] = element[i];
                wikipediaDataRow += '<tr><th scope="row">' + element[i] + '</th>';
            } else if (i == 'extract') {
                dataObject[pageid] += ' ' + element[i];
                wikipediaDataRow += '<td>' + element[i] + '</td>';
            } else if (i == 'description') {
                wikipediaDataRow += '<td>' + element[i] + '</td>';
            }
            counter++;
        }
        if (counter < 6) {
            // in case articles have no description
            wikipediaDataRow += '<td></td>';
        }
        let loadingAnimation = '<div class="loader-animation" id="loadAnimation' + pageid + '"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
        // append link to the and of the row, append tts button + hidden audio file + loading animation
        wikipediaDataRow += '<td><a href="' + wikipediaArticleLink + '">' + wikipediaArticleLink + '</a></td><td><audio id="ttsAudio' + pageid + '" controls hidden></audio>' + loadingAnimation + '</td></tr>';
    });
    wikipediaDataRow += '</tbody>';
    $('#wikipediaQueryTable').replaceWith(wikipediaDataRow);

    for (const key in dataObject) {
        var ttsData = {};
        ttsData[key] = dataObject[key];
        $.ajax({
            type: 'POST',
            url: '/tts',
            data: ttsData,
            success: function () {
                $('#ttsAudio' + key).attr('src', './sound/tts' + key + '.mp3?onload=loadAudio');
                $('#loadAnimation' + key).empty(); // delete loading animation
                $('#ttsAudio' + key).prop('hidden', false);
                $('#ttsAudio' + key)[0].load();
            },
        });
    }
}