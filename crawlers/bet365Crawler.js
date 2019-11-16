"use strict";
/*jshint esversion: 9 */

const $ = require('cheerio');
const url = 'https://www.bet365.com.cy/#/HO/';
const fs = require("fs");
const puppeteer = require('puppeteer');
const utils = require('../services/utils');
var browser;
var page;
var checkInterval;
var matches = [];
const crawl = () => {
  (async () => {
    browser = await puppeteer.launch({
      headless: false, // if you run it headless, you will be kicked after the first time
      slowMo: 100,
    });
    let start = new Date();
    page= await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2'});
    console.log("Setting language..")
    await languageToEnglishAndEnter();
    console.log("Attempting to go to upcoming..")
    await navigateToUpcoming();
    console.log("Mining..");
    await mine();
    console.log("Done.");
    utils.writeJsonToFile("bet365", matches);
    await browser.close();
    let done = new Date();
    console.log("Runtime: "+((done.getTime()-start.getTime())/1000.0) + "s");
  })();
};
async function languageToEnglishAndEnter(){
  await page.waitForSelector('.'+classes.languages+' a');
  await page.evaluate((classes)=>{
    let languageList = document.getElementsByClassName(classes.languages)[0];
    languageList.getElementsByTagName("li")[0].children[0].click();
  },classes);
  await page.waitForSelector('.'+classes.firstPanel+' a');
  await page.evaluate((classes)=>{
      document.getElementsByClassName(classes.firstPanel)[0].getElementsByTagName('a')[0].click();
  },classes);
}
async function navigateToUpcoming(){
  await page.waitForSelector('.'+classes.upcomingMatches)
  await page.evaluate((classes)=>{document.getElementsByClassName(classes.upcomingMatches)[0].click()},classes);
  await page.waitForSelector('.'+classes.next24Hours)
  await page.evaluate((classes)=>{document.getElementsByClassName(classes.next24Hours)[2].click()},classes);
}
async function mine(){
  await page.waitForSelector('.'+classes.matchLine);
  matches = await page.evaluate(async function(classes,marketsOfInterest){

    var matches = [];
    return await getData();

    async function getData(){
      let matchLines = document.getElementsByClassName(classes.matchLine);
      for(let l = 0; l < matchLines.length; l++){
        try{
          if(isCollapsed(matchLines[l])){
            matchLines[l].click();
            await sleep(10);
          }
        }catch(e){
          console.log(e);
        }
      }
      for(let l = 0; l < matchLines.length; l++){
        try{
          let league = matchLines[l].getElementsByClassName(classes.leagueWrapper)[0];
          getInfoFromLeague(league);
        }catch(e){
          console.log(e);
        }
      }
      return matches;
     }

    function isCollapsed(line){
      return line.getElementsByClassName(classes.leagueWrapper).length <= 0;
    }
    function getInfoFromLeague(league){
      let matchInfos = league.getElementsByClassName(classes.matchInfo);
      let matchSelectionRows = league.getElementsByClassName(classes.selectionRow);
      let matchHomes = matchSelectionRows[0].getElementsByClassName(classes.selectionRowOdds);
      let matchDraws = matchSelectionRows[1].getElementsByClassName(classes.selectionRowOdds);
      let matchAways = matchSelectionRows[2].getElementsByClassName(classes.selectionRowOdds);
      for(let i = 0; i < matchHomes.length; i++){
        if(!isLive(matchInfos[i]))
          mapMatch(getMatchTime(matchInfos[i]),getMatchName(matchInfos[i]),matchHomes[i].innerText,matchDraws[i].innerText,matchAways[i].innerText);
      }
    }
    function isLive(matchInfo){
      let time = matchInfo.getElementsByClassName(classes.matchTime)[0];
      return time.innerText.length <= 5 || time.innerText.includes("ET");
    }
    function getMatchTime(matchInfo){
      let time = matchInfo.getElementsByClassName(classes.matchTime)[0].innerText.split(" ");
      return time[time.length-1];
    }
    function getMatchName(matchInfo){
      return matchInfo.getElementsByClassName(classes.matchName)[0].innerText;
    }
    function mapMatch(time,name,home,draw,away){
      let split = name.split(" v ");
      let match = new Match(time,split[0],split[1]);
      match.markets[marketsOfInterest.FT+"1"] = parseFloat(home)*1000;
      match.markets[marketsOfInterest.FT+"X"] = parseFloat(draw)*1000;
      match.markets[marketsOfInterest.FT+"2"] = parseFloat(away)*1000;
      matches.push(match);
    }
    function Match(time, home, away) {
        this.time = time;
        this.home = home;
        this.away = away;
        this.markets = {};
    }
    async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

  },classes,utils.getMarketsOfInterest());
}

crawl();

var classes = {
  languages : "lpnm",
  firstPanel : "lpgb",
  upcomingMatches : "tc-TopCouponLinkButton",
  next24Hours : "cl-TimeFilterButton",
  matchLine : "ufm-MarketGroupUpcomingCompetition",
  leagueWrapper : "gll-MarketGroup_Wrapper",
  matchInfo : "sl-CouponParticipantWithBookCloses",
  matchTime : "ufm-UpcomingCouponParticipantWithBookClosesET",
  matchName : "sl-CouponParticipantWithBookCloses_Name",
  selectionRow : "ufm-MarketC4OddsSwitch",
  selectionRowName : "gll-ParticipantRowValue_Name",
  selectionRowOdds : "gll-ParticipantOddsOnly_Odds"
}