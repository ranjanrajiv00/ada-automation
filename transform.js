var fs = require("fs");
var path = require("path");
const cheerio = require('cheerio');

var today = new Date();
var environment = process.env.NODE_ENV || 'dev';
var timestamp = process.env.TIMESTAMP || today.getFullYear() + '' + (today.getMonth() + 1).toString().padStart(2, "0") + '' + today.getDate().toString().padStart(2, "0");
var host = process.env.HOST || 'http://localhost:3030';

var basePath = "reports/" + environment + "/pa11y/";
var reportPath = __dirname + '/' + basePath + '/' + timestamp;

var pal11yReport = reportPath + "//index.html";
var pal11yTransformedReport = reportPath + "//index_transformed.html";

var data = fs.readFileSync(pal11yReport);

let $ = cheerio.load(data);  //loading of complete HTML body

var generatedAt = $('main >p').text();

var baseUrl = host + '/' + environment + "/pa11y/" + timestamp + '/';
var viewDetails = "<div class='full-report'><a href='" + baseUrl + 'index.html' + "'>Full Report</a></div>"

var table = "<style>html,body {    background-color: #f3f3f3;    color: #333333;    font-family: Arial, Helvetica, sans-serif;    font-size: 16px;    line-height: 30px;    margin: 10;    padding: 0;    text-align: center;} table {    width: 1000px;    border: 0;    margin-left: auto;    margin-right: auto;    background: #ffffff;} th,td {    border-top: 1px solid #cccccc;    padding: 20px; text-align: center; font-size: 12px;} td a {    color: #4444bb;    font-size: 12px;}.data .page-name {    text-align: left;}.header {    background: #333333;    color: #ffffff;    text-align: center;}.header h2 {    margin-bottom: 10px;}.header div {    font-size: 14px;}.full-report {    margin: 20px 0;    font-size: 12px;} .error {color: red;}</style>";
table += "<table cellspacing='0' cellpadding='0'>";

table += "<tr><td class='header' colspan='4'><h2>Accessibility Report Summary</h2><div>" + generatedAt + "</div></td></tr>";

$('ul.pages > li').each(function (index) {
    const link = $(this).find('.pageLink').attr('href');
    const title = $(this).find('.pageLink').attr('title');
    const error = $(this).find('.count.error').text();
    const warning = $(this).find('.count.warning').text();
    const notice = $(this).find('.count.notice').text();

    table += '<tr class="data">';
    table += '<td class="page-name">' + (link ? '<a href="' + baseUrl + link + '">' + title + '</a>' : title) + '</td>';
    table += '<td class="error">' + (error || '--') + '</td>';
    table += '<td>' + (warning || '--') + '</td>';
    table += '<td>' + (notice || '--') + '</td>';
    table += '</tr>';
});

table += '</table>';

fs.writeFileSync(pal11yTransformedReport, viewDetails + table + viewDetails);