# irt-dashboard

Dashboard for bookings in room 2009

Reads outlook-generated CSV files & parses

JS frontend shows that day's bookings + has 15 minute alerts

## How it works


There is a powershell script used by the old dashboard, that downloads a CSV file (outcsv.csv) from the IRT outlook profile.

`CSVAPI.exe` simply parses this CSV, and then allows the dashboard index.html / index.js / index.css) to read the bookings

outcsv.csv MUST be in the folder ABOVE `CSVAPI.exe`. It will not work if they are in the same folder.


The `fields` array is the parsed version of the csv.

`fields[7]` is the main questions - since the format is just one big string, each answer and question must be stripped manually. This is what must me changed if the ms bookings mage is modified.

## How to fix it

All you need to run is `CSVAPI.exe`, and open `index.html`. As long as outcsv.csv is readable, has bookings today, and in the folder above `CSVAPI.exe`, the website should show the bookings.

If there is a change to the microsoft bookings page (i.e. the questions changed or boxes were added/removed) `CSVAPI.exe` will NOT parse the csv file correctly, and it will not work.

If there is an issue with index.html, press CTRL+SHIFT+I and open "Console" - This will show any errors from the javascript code.


If you would like to modify (or fix) this program, you can clone this repository and edit CSVAPI.cs in Visual Studio.


DO NOT BUILD IT AS "SINGLE FILE" - THE FINAL EXE WILL NOT RUN PROPERLY. You must keep `CSVAPI.exe` with all of the .dll files that were created alongside it

You may need to install visual studio redistributables to run it. Just install whichever ones it complains about.

## future plans

Completely redo the whole thing, or purely rely on MS bookings. The powershell script that retrieves the outlook data is basically magic and i would rather replace the whole thing than try to fix it.
