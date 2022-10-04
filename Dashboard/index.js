 let CSVdata = [];
let currentGap;

function startTimeToTimestamp(record) {
    return Date.parse(record.startTime.substring(6,10) + "/" + record.startTime.substring(3,5) + "/" + record.startTime.substring(0,2) + " " + record.startTime.substring(11,20))
}

async function nextApt() {
    CSVdata.forEach(record => {
        if ( ((startTimeToTimestamp(record) - Date.parse(new Date())) < 960000) && ((startTimeToTimestamp(record) - Date.parse(new Date())) > 0)) {
            footer(record.ticket + " is in " + Math.round((startTimeToTimestamp(record) - Date.parse(new Date())) / 60000) + " minutes", "orange")
        }
        else {
            footer("", "green")
        }
    })
}

async function buildTable() {
    let table = document.getElementById("table")
    table.innerHTML = ""
    let slots = (Date.parse("16:00 10/10/10") - Date.parse("9:00 10/10/10")) / 60000 / currentGap

    for (var i = 0; i <= slots; i++) {
        var row = table.insertRow(table.rows.length);
        var cell_time = row.insertCell(0)
        var cell_tech = row.insertCell(1)
        var cell_customer = row.insertCell(1)
        var cell_ticket = row.insertCell(1)
        var cell_cord = row.insertCell(1)
        var time = new Date(Date.parse("9:00 10/10/10") + currentGap * i * 60000)
        cell_time.innerHTML = time.getHours() + ":" + (time.getMinutes() < 10 ? '00' : '' + time.getMinutes());

        var validRecord = CSVdata.find(record => {

            if ((record.startTime.endsWith(cell_time.innerHTML + ":00"))) {
                return record
            };
        })

        if (validRecord != undefined) {
            cell_cord.innerHTML = validRecord["corD"]
            cell_ticket.innerHTML = validRecord["ticket"]
            cell_tech.innerHTML = validRecord["technician"]
            cell_customer.innerHTML = validRecord["customer"]

            if (cell_cord.innerHTML == "C"){
                row.style.background = "orange"
            }
            else {
                row.style.background = "MediumOrchid"
            }
        }
    }

    var title = table.insertRow(0)
    title.style["font-weight"] = 800
    var ntime = title.insertCell(0)
    var tech = title.insertCell(1)
    var customer = title.insertCell(1)
    var ticket = title.insertCell(1)
    var cord = title.insertCell(1)

    ntime.innerHTML = "Time"
    tech.innerHTML = "Technician"
    customer.innerHTML = "Customer"
    ticket.innerHTML = "Ticket"
    cord.innerHTML = "CORD"
}

async function loadCSV() {
    footer("loading CSV data...", "blue")
    try {
        CSVdata = []
        let res = await fetch("http://localhost:5000/csv")
        let parsed = await res.json()
        console.log(parsed)
        footer("", "green")

        parsed.forEach(record => {
            var timestamp = new Date(Date.parse(record.startTime))
            let endtimestamp = new Date(Date.parse(record.endTime))
            let now = new Date();

            if (timestamp == NaN) {
                return;
            }

            if (record.startTime.startsWith(((now.getDate() < 10 ? '0' : '') + (now.getDate())) + "/" + (now.getMonth() + 1) + "/" + now.getFullYear())) {
                if (currentGap == null) {
                    currentGap = (endtimestamp - timestamp) / 60000
                }
                footer("", "green")

                CSVdata.push(record)
            }
            else if (currentGap == null) {
                footer("No bookings! cannot generate table!", "orange")
            }
        });

        buildTable();
    }
    catch (e) {
        footer("Failed to get CSV data. Please make sure CSVAPI.EXE is running", "red")
        console.log(e)
    }
}

async function footer(text, colour) {
    var footer = document.getElementById('footer')
    if (text == "") {
        document.getElementById("footer").classList.add('shrink');
        document.getElementById("footer").classList.remove('grow');
    }
    else {
        document.getElementById("footer").classList.remove('shrink');
        document.getElementById("footer").classList.add('grow');
    }
    footer.style.background = colour
    footer.innerHTML = text;
}