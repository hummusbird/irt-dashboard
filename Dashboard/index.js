let CSVdata = [];
let currentGap;
let tableData = []

async function nextApt() { // show a 5 minute booking warning
    var ticketSoon = false
    tableData.forEach(record => {
        if (record.ticket == ""){
            return
        }
        else if (record.startTime - new Date() <= 900000 && record.startTime - new Date() > 0){
            footer(`${record.technician}'s ticket is in ${Math.ceil((record.startTime - new Date()) / 60000)} minutes`, "purple")
            console.log(record)
            ticketSoon = true
        }
    })
    if (ticketSoon == false && document.getElementById('footer').style.background != "red"){
        footer("", "green")
    }
}

async function buildTable() {
    let table = document.getElementById("table")
    table.innerHTML = ""
    tableData = []
    let slots = (Date.parse("16:00 10/10/10") - Date.parse("9:00 10/10/10")) / 60000 / currentGap // amount of booking slots available
    now = new Date()
    let nineAM = (Date.parse("9:00 " + ((now.getMonth() +1 ) + "/" + now.getDate() + "/" + now.getFullYear()))) // today's 9am timestamp

    for (var i = 0; i <= slots; i++) { // create an array of slots
        var currentSlot = nineAM + currentGap * i * 60000

        var validRecord = CSVdata.find(record => {
            if ((record.startTime >= currentSlot) && (record.startTime < (currentSlot + currentGap * 60000))) { // if the current slot has a valid booking, display
                tableData.push(record)
                return record
            }
        })

        if (validRecord == undefined) { // if no valid booking, create a blank slot
            tableData.push(
                {
                    startTime: currentSlot,
                    endTime: currentSlot + currentGap * 60000,
                    corD: "",
                    ticket: "",
                    customer: "",
                    technician: "",
                    location: ""
                }
            )
        }
    }
    console.log(tableData)

    tableData.forEach(record => { // insert info into HTML table
        var row = table.insertRow(table.rows.length);
        var cell_time = row.insertCell(0)
        var cell_location = row.insertCell(1)
        var cell_tech = row.insertCell(1)
        var cell_customer = row.insertCell(1)
        var cell_ticket = row.insertCell(1)
        var cell_cord = row.insertCell(1)
        
        var time = new Date(record.startTime)
        cell_time.innerHTML = time.getHours() + ":" + (time.getMinutes() < 10 ? '00' : '' + time.getMinutes());

        cell_cord.innerHTML = record["corD"]
        cell_ticket.innerHTML = record["ticket"]
        cell_tech.innerHTML = record["technician"]
        cell_customer.innerHTML = record["customer"]
        cell_location.innerHTML = record["location"].replace("*****************************", "") // backwards compatibility

        if (cell_cord.innerHTML == "C") {
            row.style.background = "SeaGreen"
        }
        else if (cell_cord.innerHTML == "D") {
            row.style.background = "rebeccapurple"
        }
        else if (cell_cord.innerHTML == "Both"){
            row.style.background = "chocolate"
        }
    })

    var title = table.insertRow(0)
    //title.style["font-weight"] = "bolder"
    title.style["background"] = "white"
    title.style["color"] = "black"
    var ntime = title.insertCell(0)
    var location = title.insertCell(1)
    var tech = title.insertCell(1)
    var customer = title.insertCell(1)
    var ticket = title.insertCell(1)
    var cord = title.insertCell(1)
    

    ntime.innerHTML = "Time"
    tech.innerHTML = "Technician"
    customer.innerHTML = "Customer"
    ticket.innerHTML = "Ticket"
    cord.innerHTML = "C/D"
    location.innerHTML = "Location"
}

async function loadCSV() { // get booking info from CSVAPI.exe
    footer("loading CSV data...", "blue")
    try {
        CSVdata = []
        let res = await fetch("http://localhost:5000/csv")
        let parsed = await res.json()
        console.log(parsed)
        footer("", "green")

        parsed.forEach(record => {
            var timestamp = new Date(record.startTime)
            let endtimestamp = new Date(record.endTime)
            let now = new Date();

            if (timestamp == NaN) {
                return;
            }

            if ((timestamp.getMonth() + "/" + timestamp.getDate() + "/" + timestamp.getFullYear()) == (now.getMonth() + "/" + now.getDate()+ "/" + now.getFullYear())) { // match against today's date
                if (currentGap == null) {
                    currentGap = (endtimestamp - timestamp) / 60000 // how long is each booking - used to determine how many slots there are in one day.
                }
                footer("", "green")
                nextApt();
                CSVdata.push(record)
            }
            else if (currentGap == null) {
                footer("No bookings! Woohoo!", "Tomato")
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