//crawling management
var childProcess = require('child_process');
var done = 0;
const utils = require('./services/utils');
const dm = require('./services/dataManipulator');
const elastic = require('./services/elasticsearchService');

var finalData;

processData()
// var updateData = setInterval(()=>{
//     done = 0;
//     dm.getLabels().forEach(crawler=>runScript("crawlers/"+crawler+"Crawler.js"));
// }, toMins(5));

function toMins(minutes){
    return minutes * 1000 * 60;
}

function runScript(scriptPath) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        console.log("Error with "+scriptPath);
        done ++;
        if(done >= toRun.length){
           processData();
        }
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var msg = code === 0 ? "Done with "+scriptPath : "Error with "+scriptPath;
        console.log(msg);
        done ++;
        if(done >= dm.getLabels().length){
            processData();
        }
    });

}
async function processData(){
    let data = dm.mapData();
    utils.writeJsonToFile("compared-files",data);
    let dataBreakDown = dm.breakDownData(data);
    await elastic.clearAll();
    await elastic.insertData(dataBreakDown);
}

// server part
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Crawling, go away\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});