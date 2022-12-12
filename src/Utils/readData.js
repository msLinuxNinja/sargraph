


function parseRow (row) { // parses rows and identifies if there's AM/PM or not in the second column, diferentiating between 12hr and 24hr formats (different versions of sar). Also removes RESTART lines
    if (row.includes("RESTART")) {
        return ""
    }

    const emptySplit = row.toString().split(' '); // split by empty space
   
    const commaSplit = emptySplit.toString().split(','); // toString adds a comma at the end, this removes it
    let filtered = commaSplit.filter(entry => {
        return entry.trim() !== '';  // remove empty spaces from the array
    });

    if (filtered[1] === 'AM' || filtered[1] === 'PM'  ) {
        filtered[0] = filtered[0] + ' ' + filtered[1];
        filtered.splice(1,1);

    }

    return filtered; // returns an array filtered and with 12hr or 24hr format normalized (i.e. 01:00:00PM vs 01:00:00 either on column 1)

}

export default function readData(data) { //used when uploading file through the dropzone
    try {
        const rows = data.split('\n'); // split by line break
        const sarData = rows.map(parseRow);
        const sarDataNoSpaces = sarData.filter(element => String(element).trim()); // removes spaces from the sar file (simplifies parsing)
        return sarDataNoSpaces;
    } catch (e) {
        console.error(e);
    }    
}

