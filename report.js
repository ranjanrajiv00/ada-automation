var fs = require("fs");
var path = require("path");
var brandPages = require("./brandPages");

var data = fs.readFileSync("results.json", "utf8");

var words = JSON.parse(data);
var urlArray = [];
var minorArray = [];
var moderateArray = [];
var seriousArray = [];
var criticalArray = [];

var minor = 0;
var moderate = 0;
var serious = 0;
var critical = 0;

var today = new Date();
var environment = process.env.NODE_ENV || 'dev';
var timestamp = process.env.TIMESTAMP || today.getFullYear() + '' + (today.getMonth() + 1).toString().padStart(2, "0") + '' + today.getDate().toString().padStart(2, "0");
var host = process.env.HOST || 'http://localhost:3030';

function toEDT() {
    var options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        timeZone: 'America/New_York'
    }

    var currentDateTime = new Date().toLocaleString("en-US", options);
    return currentDateTime;
}

// Write two methods buildSummary & buildHtml
function buildHtml() {
    var html = "<style>  html, body { background-color: #f3f3f3; color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 22px; margin: 10; padding: 0; } .category { border: 1px solid #333333; background-color:#ffffff; padding:10px; margin:20px 0 } .heading { font-size:24px; margin-top:50px; } .summary { margin-top:50px; text-align: left; }  </style> <div class='summary'>";
    // categorise based on the type of impact

    for (var i = 0; i < words.length; i++) {
        minor = 0;
        moderate = 0;
        serious = 0;
        critical = 0;

        html += "<div> <h1 class='heading'>" + words[i].url + "</h1> </div>";
        urlArray.push(words[i].url);

        var criticalSummary = [];
        var seriousSummary = [];
        var moderateSummary = [];
        var minorSummary = [];

        words[i].violations.forEach(function (val) {
            var keys = Object.keys(val);
            var summaryLine = "<div class = 'category'>";
            keys.forEach(function (key) {
                if (key == "nodes") {
                    summaryLine += "<strong>Suggestion : </strong>";
                    val[key].forEach(function (val) {
                        summaryLine += val.failureSummary.replace("<", "lt;").replace(">", "gt;");
                        summaryLine += "<br>";
                        if (val.all && val.all.length) {
                            critical += val.all.length - 1;
                        }
                    });
                }
                else if (key == "impact") {
                    var color = "";
                    if (val.impact == "minor") {
                        color = "orange"
                    }

                    if (val.impact == "moderate") {
                        color = "darkorange"
                    }

                    if (val.impact == "serious") {
                        color = "red"
                    }

                    if (val.impact == "critical") {
                        color = "maroon";
                    }

                    summaryLine += "<strong>  Impact :</strong> <font color=" + color + ">" + val.impact.replace("<", "lt;").replace(">", "gt;") + "</font><br>";
                }

                else if (key == "description")
                    summaryLine += "<strong> Issue : </strong>" + val[key].replace("<", "lt;").replace(">", "gt;") + "<br>";
            });

            summaryLine += "</div>";

            if (val.impact == "minor") {
                minor++;
                minorSummary.push(summaryLine);
            }

            if (val.impact == "moderate") {
                moderate++;
                moderateSummary.push(summaryLine);
            }

            if (val.impact == "serious") {
                serious++;
                seriousSummary.push(summaryLine);
            }

            if (val.impact == "critical") {
                critical++;
                criticalSummary.push(summaryLine);
            }
        });

        if (criticalSummary.length) {
            html += "<span id='critical-" + words[i].url + "'></span>";
            criticalSummary.forEach(function (item) {
                html += item;
            });
        }

        if (seriousSummary.length) {
            html += "<span id='serious-" + words[i].url + "'></span>";
            seriousSummary.forEach(function (item) {
                html += item;
            });
        }

        if (moderateSummary.length) {
            html += "<span id='moderate-" + words[i].url + "'></span>";
            moderateSummary.forEach(function (item) {
                html += item;
            });
        }

        if (minorSummary.length) {
            html += "<span id='minor-" + words[i].url + "'></span>";
            minorSummary.forEach(function (item) {
                html += item;
            });
        }

        minorArray.push(minor);

        moderateArray.push(moderate);

        seriousArray.push(serious);

        criticalArray.push(critical);
    }

    html += "</div>";
    return html;
}

function findUrl(url) {
    var allURLs = Object.keys(brandPages);

    for (var i = 0; i < allURLs.length; i++) {
        if (url.indexOf(allURLs[i]) > -1) {
            return brandPages[allURLs[i]];
        }
    }
}


function buildSummary() {
    var html = "<style>html,body {    background-color: #f3f3f3;    color: #333333;    font-family: Arial, Helvetica, sans-serif;    font-size: 16px;    line-height: 22px;    margin: 10;    padding: 0;    text-align: center;}table {    width: 850px;    border: 0;    margin-left: auto;    margin-right: auto;    background: #ffffff;}th,td {    padding: 20px;    border-top: 1px solid #333333;    text-align: center;}.data td>a {    color: #4444bb;    font-size: 12px;}.data .page-name {    text-align: left;}.header {    background: #333333;    color: #ffffff;    text-align: center;}.header h2 {    margin-bottom: 10px;}.header div {    font-size: 14px;}.full-report {    margin: 20px 0;    font-size: 12px;}</style>";
    html += "<table cellspacing='0' cellpadding='0'>";
    html += "<tr><td class='header' colspan='5'><h2>Accessibility Report Summary</h2><div>Generated at : " + toEDT() + "</div></td></tr>";
    html += "<tr class='data'><th class='page-name'>PAGE</th><th> <font color='maroon'>CRITICAL (P1)</font> </th>   <th>  <font color='red'>SERIOUS (P2)</font> </th>   <th>  <font color='darkorange'>MODERATE (P3)</font> </th>     <th>  <font color='orange'>MINOR (P4)</font> </th>     </tr>";
    // categorise based on the type of impact
    for (var i = 0; i < words.length; i++) {
        var pageProp = urlArray[i] && (brandPages[urlArray[i].trim()] || findUrl(urlArray[i].trim()));
        if (pageProp) {
            html += "<tr class='data'>";
            html += "<td class='page-name'><a href='" + urlArray[i] + "'>" + pageProp.brand + " - " + pageProp.page + "</a></td>"
            html += "<td><a href='" + baseUrl + "#critical-" + urlArray[i] + "'>" + criticalArray[i] + "</a></td>"
            html += "<td><a href='" + baseUrl + "#serious-" + urlArray[i] + "'>" + seriousArray[i] + "</a></td>"
            html += "<td><a href='" + baseUrl + "#moderate-" + urlArray[i] + "'>" + moderateArray[i] + "</a></td>"
            html += "<td><a href='" + baseUrl + "#minor-" + urlArray[i] + "'>" + minorArray[i] + "</a></td>"
            html += "</tr>";
        }
    }
    html += "</table>";

    return html;
}

var basePath = "reports/" + environment;
var reportPath = __dirname + '/' + basePath + '/' + timestamp;

if (!fs.existsSync(basePath))
    fs.mkdirSync(basePath);

if (!fs.existsSync(reportPath))
    fs.mkdirSync(reportPath);

var summaryfileName = reportPath + "//result.html";
try {
    var fileName = reportPath + "//summary.html";
    var stream = fs.createWriteStream(fileName);
    var baseUrl = host + '/' + environment + "/" + timestamp + '/' + 'summary.html';

    stream.once("open", function (fd) {
        var html = buildHtml();
        var summary = buildSummary();

        stream.end(summary + html);
    });

    var summarystream = fs.createWriteStream(summaryfileName);

    summarystream.once("open", function (fd) {
        var viewDetails = "<div class='full-report'><a href='" + baseUrl + "'>Full Report</a></div>"

        var summary = viewDetails + buildSummary() + viewDetails;
        summarystream.end(summary);
    });
}
catch (ex) {
    console.log("ex", ex);
}