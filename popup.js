function updatePopup(results) {
    if (!results[0]) return
    var data = results[0]
    var dates = data.dates
    var keys = Object.keys(dates).reverse()
    var htmlString = ''
    for (var i = 0; i < keys.length; ++i) {
        htmlString = htmlString + `<table class="table table-hover table-sm">
        <thead>
        <tr>
        <th scope="col">${keys[i]}</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td>Completed: ${dates[keys[i]].active}</td>
        </tr>
        <tr>
        <td>Pending: ${dates[keys[i]].pendingCompletion}</td>
        </tr>
        <tr>
        <td>Cancelled: ${dates[keys[i]].cancelled}</td>
        </tr>
        <tr>
        <td>Other: ${dates[keys[i]].other}</td>
        </tr>
        <tr>
        <td>Total: ${dates[keys[i]].total}</td>
        </tr>
        </tbody>
        </table>`
    }
    htmlString = htmlString + '<div></div>'
    document.getElementById("textBox").innerHTML = htmlString


    var link = document.createElement("a");
    link.classList.add("btn")
    link.classList.add("btn-primary")
    link.textContent = 'Download CSV Caution - contains PID'
    link.setAttribute("href", results[0].encodedUri);
    link.setAttribute("download", "pinnacle.csv");
    document.body.appendChild(link); // Required for FF
    // link.click();

}

function code() {
    if (window.location.hostname !== 'outcomes4health.org') return

    var tbl = document.getElementsByTagName("table")[0]

    var tbody = tbl.firstElementChild
    var totalRows = tbody.children.length

    var total = 0
    var totalActive = 0
    var totalPendingCompletion = 0
    var totalOther = 0
    var dates = {

    }
    var csv = 'data:text/csv;charset=utf-8,"Date","Name","NHS Number","Postcode","Date of Birth","Vaccine Number","User","Status"\n'

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
        if (item.innerHTML.includes('<span class="active">Active</span>')
            || item.innerHTML.includes('<span class="active">Completed</span>')) {
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

        var pid = item.children[2].textContent.split(/\u2022/)

        var dob = pid[2].replace(/[^a-zA-Z0-9\- ]/g, "") //just letters and numbers and -
        var name = pid[1].replace(/[^a-zA-Z0-9 ]/g, "") //just letters and numbers
        var nhs = pid[3].replace(/[^a-zA-Z0-9 ]/g, "") //just letters and numbers
        var postcode = pid[4].replace(/[^a-zA-Z0-9 ]/g, "") //just letters and numbers
        var vaccNum = item.children[4].textContent.replace(/[^a-zA-Z ]/g, "") //just letters
        var user = item.children[5].textContent.replace(/[^a-zA-Z ]/g, "") //just letters
        var status = item.children[6].textContent.replace(/[^a-zA-Z ]/g, "").replace('ClicktoCancel', "").replace('Click to reinstate', "")
        csv += '"' + date + '","' + name + '","' + nhs + '","' + postcode + '","' + dob + '","' + vaccNum + '","' + user + '","' + status + '"\n'


    }

    var encodedUri = encodeURI(csv);
    var data = {
        total, totalActive, totalPendingCompletion, totalOther, dates, encodedUri
    }

    return data


}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // This should lock onto the active tab in the active window
    var tab = tabs[0];
    chrome.tabs.executeScript(tab.id, {
        code: '(' + code.toString() + ')();'
    }, updatePopup);
});
