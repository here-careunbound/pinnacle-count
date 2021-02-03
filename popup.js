const updatePopup = results => {
    if (!results[0]) return
    const data = results[0]
    if (typeof data === 'string') {
        const txtBox = document.getElementById("textBox")
        txtBox.textContent = data
        txtBox.classList.add('text-danger')
        return
    }
    const dates = data.dates
    const keys = Object.keys(dates).reverse()
    let htmlString = ''
    for (let i = 0; i < keys.length; ++i) {
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


    const link = document.getElementById("downloadBtn");
    link.classList.remove("disabled")
    link.setAttribute("href", results[0].encodedUri);
    link.setAttribute("download", "pinnacle.csv");
    document.body.appendChild(link); // Required for FF
    // link.click();

}

const code = () => {
    if (window.location.hostname !== 'outcomes4health.org') return 'This extension only works on outcomes4health.org'
    var tbl = document.getElementsByTagName("table")[0]
    if (!tbl) return 'Cannot find data on this page - make sure you are on the \'Full Provision History\' page.'

    var tbody = tbl.firstElementChild
    var totalRows = tbody.children.length

    var total = 0
    var totalActive = 0
    var totalPendingCompletion = 0
    var totalOther = 0
    var dates = {

    }
    var csv = 'data:text/csv;charset=utf-8,"Pinnacle Id","Date","Name","NHS Number","Postcode","Date of Birth","Vaccine Number","User","Status"\n'

    for (var i = 1; i < totalRows; ++i) { //skip first row!

        var item = tbody.children[i];
        var firstCol = item.firstElementChild
        var date = firstCol.textContent.substring(0, 10)
        var href = firstCol.firstElementChild.getAttribute("href")

        var qs = new URLSearchParams(href.substring(href.search('\\?'), href.length))
        var pinId = qs.get('edit')

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

        let dob = ''
        let name = ''
        let nhs = ''
        let postcode = ''

        const pid = item.children[2].textContent.split(/\u2022/)
        if (pid.length >= 5) {
            dob = pid[2].replace(/[^a-zA-Z0-9\- ]/g, "") //just letters and numbers and -
            name = pid[1].replace(/[^a-zA-Z0-9 ]/g, "") //just letters and numbers
            nhs = pid[3].replace(/[^a-zA-Z0-9 ]/g, "") //just letters and numbers
            postcode = pid[4].replace(/[^a-zA-Z0-9 ]/g, "") //just letters and numbers
        }

        const vaccNum = item.children[4].textContent.replace(/[^a-zA-Z ]/g, "") //just letters
        const user = item.children[5].textContent.replace(/[^a-zA-Z ]/g, "") //just letters
        const status = item.children[6].textContent.replace(/[^a-zA-Z ]/g, "").replace('ClicktoCancel', "").replace('Click to reinstate', "")
        csv += '"' + pinId + '","' + date + '","' + name + '","' + nhs + '","' + postcode + '","' + dob + '","' + vaccNum + '","' + user + '","' + status + '"\n'


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
