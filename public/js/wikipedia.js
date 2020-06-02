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
        $('#wikipediaQueryModal').modal('toggle');
        var searchUrl = 'http://localhost:6001/proxy/?https://de.wikipedia.org/w/api.php?action=query&generator=prefixsearch&format=json&gpslimit=4&prop=extracts%7Cdescription&exintro=1&explaintext=1&exsentences=3&redirects=1&gpssearch=' + searchKey;
        $.ajax({
            url: searchUrl,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                evaluateWikipediaData(data);
            },
            error: function (request, error) {
                console.log(error + 'Request:' + JSON.stringify(request));
            },
        });
        return false;
    }
});

function evaluateWikipediaData(data) {
    let wikipediaDataRow = '<tbody id="wikipediaQueryTable">';
    Object.values(data.response.query.pages).forEach((element) => {
        var wikipediaArticleLink = 'https://de.wikipedia.org/?curid=',
            counter = 0;
        for (var i in element) {
            console.log(i + counter);
            if (i == 'pageid') {
                wikipediaArticleLink += element[i];
            } else if (i == 'title') {
                wikipediaDataRow += '<tr><th scope="row">' + element[i] + '</th>';
            } else if (i == 'extract') {
                wikipediaDataRow += '<td>' + element[i] + '</td>';
            } else if (i == 'description') {
                wikipediaDataRow += '<td>' + element[i] + '</td>';
            }
            counter++;
        }
        if (counter < 6) {
            // in case articles have no descrition
            wikipediaDataRow += '<td></td>';
        }
        // append link to the and of the row
        wikipediaDataRow += '<td><a href="' + wikipediaArticleLink + '">' + wikipediaArticleLink + '</a></td></tr>';
    });
    wikipediaDataRow += '</tbody>';
    $('#wikipediaQueryTable').replaceWith(wikipediaDataRow);
}
