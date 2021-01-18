
function display(results) {
    var data = results[0]
    var keys = Object.keys(data)
    var text = ''
    for (var i = 0; i < keys.length; ++i) {
        text = text + '<div>' + keys[i] + ': ' + data[keys[i]] + '</div>'
    }
    document.querySelector("#id1").innerHTML = text
}

function code() {
    var tbl = document.getElementsByTagName("table")[0]
    var tbody = tbl.firstElementChild
    var totalRows = tbody.children.length

    var totalActive = 0
    var dates = {

    }
    for (var i = 1; i < totalRows; ++i) { //skip first row!
        var item = tbody.children[i];
        if (item.innerHTML.includes('<span class="active">Active</span>')) {
            totalActive++
        }
        var firstCol = item.firstElementChild
        var date = firstCol.textContent.substring(0, 10)
        if (dates[date] == undefined) {
            dates[date] = 1
        } else {
            dates[date]++
        }

    }
    console.log('total rows', totalRows)
    console.log('total active', totalActive)
    console.log(dates)

    return dates
}

chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    chrome.tabs.executeScript(tab.id, {
        code: '(' + code.toString() + ')();'
    }, display);
});