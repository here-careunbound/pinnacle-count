
function display(results) {
    var data = results[0]
    var dates = data.dates
    var keys = Object.keys(dates)
    var text = ''
    for (var i = 0; i < keys.length; ++i) {
        text = text + '<div style=\'margin-bottom: 5px;\'><h3 style=\'margin-bottom: 0px;\'>' + keys[i] + '</h3><div>Active: ' + dates[keys[i]].active + '</div><div>Pending: ' + dates[keys[i]].pendingCompletion + '</div><div>Cancelled: ' + dates[keys[i]].cancelled + '</div><div>Other: ' + dates[keys[i]].other + '</div><div>Total: ' + dates[keys[i]].total + '</div></div>'
    }
    text = text + '<div></div>'
    document.getElementById("textBox").innerHTML = text
}

function code() {
    var tbl = document.getElementsByTagName("table")[0]
    var tbody = tbl.firstElementChild
    var totalRows = tbody.children.length

    var total = 0
    var totalActive = 0
    var totalPendingCompletion = 0
    var totalOther = 0
    var dates = {

    }
    for (var i = 1; i < totalRows; ++i) { //skip first row!

        var item = tbody.children[i];
        var firstCol = item.firstElementChild
        var date = firstCol.textContent.substring(0, 10)

        // check objects initialised
        if (dates[date] == undefined) {
            dates[date] = {}
        }
        if (dates[date].active == undefined) {
            dates[date].active = 0
        }
        if (dates[date].pendingCompletion == undefined) {
            dates[date].pendingCompletion = 0
        }
        if (dates[date].cancelled == undefined) {
            dates[date].cancelled = 0
        }
        if (dates[date].other == undefined) {
            dates[date].other = 0
        }
        if (dates[date].total == undefined) {
            dates[date].total = 0
        }

        // update counters
        total++
        dates[date].total++
        if (item.innerHTML.includes('<span class="active">Active</span>')) {
            dates[date].active++
            totalActive++
        } else if (item.innerHTML.includes('<span class="warning">Pending</span> <br><small>awaiting completion</small>')) {
            dates[date].pendingCompletion++
            totalPendingCompletion++
        } else if (item.innerHTML.includes('<span class="cancelled">Cancelled</span>')) {
            dates[date].cancelled++

        } else {
            dates[date].other++
            totalOther++
        }

    }
    var data = {
        total, totalActive, totalPendingCompletion, totalOther, dates
    }
    console.log(data)
    return data
}

chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    chrome.tabs.executeScript(tab.id, {
        code: '(' + code.toString() + ')();'
    }, display);
});