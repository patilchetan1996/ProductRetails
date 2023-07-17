// This file contains all the common utility functions which can be used
// by all modules

////////////// To put zero in front of single digit number ////////////////////
function pad(num) {
    return (num < 10) ? ("0" + num) : num;
}

///////////////// To convert the Date object to local YYYY-MM-DD HH24:MI:SS format string  ///////////////////////////////////////
function convertLocalDateToStrYYYYMMDDHH24MMSS(inpDate) {

    let dy = inpDate.getYear()+1900;
    let dm = inpDate.getMonth()+1;
    let dd = inpDate.getDate();
    let dh = inpDate.getHours();
    let dmin = inpDate.getMinutes();
    let ds = inpDate.getSeconds();

    let strDateAsString = pad(dy) + "-" + pad(dm) + "-" + pad(dd) + " " + pad(dh) + ":" + pad(dmin) + ":" + pad(ds);

    return strDateAsString;
}

///////////////// To convert the Date object to UTC YYYY-MM-DD HH24:MI:SS format string  ///////////////////////////////////////
function convertUTCDateToStrYYYYMMDDHH24MMSS(inpDate) {

    let dy = inpDate.getUTCFullYear();
    let dm = inpDate.getUTCMonth()+1;
    let dd = inpDate.getUTCDate();
    let dh = inpDate.getUTCHours();
    let dmin = inpDate.getUTCMinutes();
    let ds = inpDate.getUTCSeconds();

    let strDateAsString = pad(dy) + "-" + pad(dm) + "-" + pad(dd) + " " + pad(dh) + ":" + pad(dmin) + ":" + pad(ds);

    return strDateAsString;
}



///////////////// To convert UTC Date string to Local Date with Format 'DD-MMM-YY HH24:MI:SS' ///////////////////////////////////////
function convertUTCDateStringToLocalDateWithFormatDDMMMYYHH24MISS( UTCDateString ) {

    let strUTCdate = UTCDateString;

    let inpDate = new Date(strUTCdate);

    let strArrMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let dy = inpDate.getYear()+1900;
    let dm = strArrMonths[inpDate.getMonth()];
    let dd = inpDate.getDate();
    let dh = inpDate.getHours();
    let dmin = inpDate.getMinutes();
    let ds = inpDate.getSeconds();

    let strDateAsString = pad(dd) + "-" + dm + "-" + pad(dy) + " " + pad(dh) + ":" + pad(dmin) + ":" + pad(ds);

    return strDateAsString;

}

///////////////// To convert Local Date with Format 'DD-MMM-YY ' ///////////////////////////////////////
function convertLocalDateWithFormatDDMMMYY( LocalDateString ) {

    let strLocaldate = LocalDateString;

    let inpDate = new Date(strLocaldate);

    let strArrMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let dy = inpDate.getYear()+1900;
    let dm = strArrMonths[inpDate.getMonth()];
    let dd = inpDate.getDate();

    let strDateAsString = pad(dd) + "-" + dm + "-" + pad(dy);

    return strDateAsString;

}


///////////////// To Replace Local Date string with 'Today' for current Date  ///////////////////////////////////////

function convertLocalDateToDisplayToday( LocalDateString ) {


    let inpDate = new Date(LocalDateString);
    let strDateTimeLocale;

    if( new Date(inpDate).getFullYear() == new Date().getFullYear() && 
        new Date(inpDate).getDate() == new Date().getDate() && 
        new Date(inpDate).getMonth() == new Date().getMonth()
        ) {
            strDateTimeLocale =  "Today," + " " + pad(new Date(inpDate).getHours()) + ":" + pad(new Date(inpDate).getMinutes()) + ":" + pad(new Date(inpDate).getSeconds());
        } else {
            strDateTimeLocale = LocalDateString;
        }

    return strDateTimeLocale;

}

///////////////// To trim the String, and if last character is ',' then remove ',' and agin trim.///////////////////////////////////////
function trimStringAndRemoveTrailingComma( inString ) {
    
    if(inString == null || inString.length <= 0) {
        return inString; // No need to process further.
    } else {
        let strAfterFirstTrim = inString.trim();
        let strAfterFirstTrimLength = strAfterFirstTrim.length;
        let strAfterSlice;
        let strRetVal;

        if(strAfterFirstTrim.charAt(strAfterFirstTrimLength - 1) == ',') {
            strAfterSlice = strAfterFirstTrim.slice(0, -1);
            strRetVal = strAfterSlice.trim();
        } else {
            strRetVal = strAfterFirstTrim;
        }

        return strRetVal;         
    }
}

module.exports.convertUTCDateStringToLocalDateWithFormatDDMMMYYHH24MISS = convertUTCDateStringToLocalDateWithFormatDDMMMYYHH24MISS;
module.exports.trimStringAndRemoveTrailingComma = trimStringAndRemoveTrailingComma;
module.exports.convertLocalDateToDisplayToday = convertLocalDateToDisplayToday;
module.exports.convertUTCDateToStrYYYYMMDDHH24MMSS = convertUTCDateToStrYYYYMMDDHH24MMSS;
module.exports.convertLocalDateToStrYYYYMMDDHH24MMSS = convertLocalDateToStrYYYYMMDDHH24MMSS;
module.exports.pad = pad;