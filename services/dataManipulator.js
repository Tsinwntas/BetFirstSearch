const fs = require('fs');
const utils = require('./utils');

var labels = [
    "bet365",
    "winmasters",
    "stoiximan",
    // "ubet"
];
var dataTimeMap = [];
var dataMap = [];

module.exports = {
    getLabels: function(){
        return labels;
    },
    mapData: function (){  
        console.log("Mapping data..");
        let data = gatherData();
        data.forEach(d=>{
            map(d);
        })
        console.log("Data Mapped.");
        console.log("Cleaning up..")
        cleanUpMap();
        console.log("Sparkling clean.")
        return dataMap;
    },
    breakDownData: function(data){
        let dataBreakdown = [...data];
        dataBreakdown = renameData(dataBreakdown);
        dataBreakdown = breakDataToIndividualEntries(dataBreakdown);
        return dataBreakdown;
    }
}
function gatherData(){
    let data = [];
    labels.forEach(l=>{
        let dataRetrieved = JSON.parse(fs.readFileSync('./data-mined/'+l+'.json'));
        dataRetrieved.label = l;
        data.push(dataRetrieved)
    })
    return data;
}
function map(data){
    console.log("Mapping "+data.label+"..");
    data.forEach(d=>{
        d.label = data.label;
        mapMatch(d);
    })
    console.log("Mapped.")
}
function mapMatch(match){
    let matchesOfSameTime = dataTimeMap[match.time];
    if(!matchesOfSameTime){
        initDataTimeMapFirstTime(match);
        initDataMapFirstTime(match);
    }else{
        let override = -1;
        let threshold = 70;
        let max = -1;
        let bestMatch;
        matchesOfSameTime.forEach((m,index)=>{
            if(m.label != match.label){
                let curr = Math.max(utils.jaroWinkler(m.home,match.home),utils.jaroWinkler(m.away,match.away));
                if(curr > max){
                    max = curr;
                    bestMatch = m;
                }
            }
        });
        matchesOfSameTime.push(match);
        if(max >= threshold){
            match.similarity = max;
            match.index = bestMatch.index;
            checkIfBestAndInsert(match);
        }else{
            initDataMapFirstTime(match);
        }
    }
}
function initDataTimeMapFirstTime(match){
    dataTimeMap[match.time] = [];
    dataTimeMap[match.time].push(match);
}
function initDataMapFirstTime(match){
    match.index = match.home+"-"+match.away+"-"+match.time;
    dataMap[match.index] = [];
    dataMap[match.index].push(match);
}
function checkIfBestAndInsert(match){
    let index = dataMap[match.index].findIndex(m=>m.label == match.label);
    if(index == -1) return dataMap[match.index].push(match);
    if(match.similarity > dataMap[match.index][index].similarity)
    dataMap[match.index][index] = match;
}
function cleanUpMap(){
    let temp = [];
    Object.keys(dataMap).forEach(data=>{
        temp.push({home:dataMap[data][0].home,away:dataMap[data][0].away,time:dataMap[data][0].time,findings:dataMap[data]})
    })
    dataMap = [];
    dataMap = temp;
}
function renameData(data){
    data.forEach(match=>{
        let name = getSearchName(match);
        let biggestNameHome = getBiggestName(match,"home");
        let biggestNameAway = getBiggestName(match,"away");
        match.findings.forEach(finding=>{
            finding.name = name+""+name;
            finding.home = biggestNameHome;
            finding.away = biggestNameAway;
        })
    })
    return data;
}
function getSearchName(match){
    let name = "";
    match.findings.forEach(finding=>{
        let currentName = (finding.home+"vs"+finding.away).toLowerCase().replace(/[^a-z0-9]/g,"");
        if(!name.includes(currentName))
            name+=currentName;
    })
    return name
}
function getBiggestName(match,field){
    let biggestName = "";
    match.findings.forEach(finding=>{
        if(finding[field].length > biggestName.length)
            biggestName = finding[field];
    })
    return biggestName;
}
function breakDataToIndividualEntries(data){
    let individualEntries = [];
    data.forEach(match=>{
        match.findings.forEach(finding=>{
            individualEntries.push(finding)
        })
    })
    return individualEntries;
}