"use strict";
/*jshint esversion: 9 */

const $ = require('cheerio');
const url = 'https://www.winmasters.com.cy/en/sports/football/';
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
    await page.goto(url);
    console.log("Navigating to next matches..")
    await navigateToNextMatches();
    console.log("Mining..");
    await mine();
    console.log("Done.");
    utils.writeJsonToFile("winmasters", matches);
    await browser.close();
    let done = new Date();
    console.log("Runtime: "+((done.getTime()-start.getTime())/1000.0) + "s");
  })();
};
async function navigateToNextMatches(){
  await page.waitForSelector('.'+classes.menuTabs);
  return await page.evaluate(async function(classes){
    return document.getElementsByClassName(classes.menuTabs)[2].lastElementChild.click();
  },classes);
}
async function mine(){
  await page.waitForSelector('.'+classes.matchLine)
  matches = await page.evaluate(async function(classes,marketsOfInterest){
    var matchLines = await scrollUnillAllMatchesAreLoaded();
    var matches = [];
    getData();
    return matches;
    async function scrollUnillAllMatchesAreLoaded(){
      let matchLines = [];
      let elementsFound = document.getElementsByClassName(classes.matchLine);
      while(insertNewLines(matchLines,elementsFound)){
        window.scrollBy(0, elementsFound[elementsFound.length-1].getBoundingClientRect().top);
        await sleep(300);
        elementsFound = document.getElementsByClassName(classes.matchLine);
      }
      let nextPage;
      let tommorowTab = document.getElementsByClassName(classes.dateTab)[1];
      if(!tommorowTab.className.includes("active"))
      {
        window.scrollTo(0,0);
        tommorowTab.click();
        await sleep(1500);
        nextPage = await scrollUnillAllMatchesAreLoaded();
      }
      matchLines = cleanUpArray(matchLines);
      if(nextPage){
        matchLines = matchLines.concat(nextPage);
      }
      return matchLines;
    }
    function insertNewLines(matchLines, lines){
      let foundNewLines = false;
      for(let i = 0; i < lines.length; i ++){
        if(!matchLines[lines[i].innerText]){
          foundNewLines = true;
          matchLines[lines[i].innerText] = lines[i];
        }
      }
      return foundNewLines;
    }
    function cleanUpArray(array){
      let toClone = [];
      Object.keys(array).forEach(item=>{
        toClone.push(array[item]);
      })
      return toClone;
    }
    function getData(){
      let matches = [];
      matchLines.forEach(match=>{
        try{
          let time = getMatchTime(match);
          let name = getMatchName(match);
          let home = getSelectionOdd(match,0);
          let draw = getSelectionOdd(match,1)
          let away = getSelectionOdd(match,2);
          mapMatch(time,name,home,draw,away);
        }catch(e){
          console.log(e);
        }
      })
    }
    function getMatchTime(match){
      return match.getElementsByClassName(classes.matchTime)[0].innerText;
    }
    function getMatchName(match){
      return [match.getElementsByClassName(classes.matchName)[0].innerText, match.getElementsByClassName(classes.matchName)[1].innerText]
    }
    function getSelectionOdd(match,index){
      return match.getElementsByClassName(classes.selectionRowOdds)[index].innerText;
    }
    function mapMatch(time,name,home,draw,away){
      let match = new Match(time,name[0],name[1]);
      match.markets[marketsOfInterest.FT+"1"] = parseFloat(home)*100;
      match.markets[marketsOfInterest.FT+"X"] = parseFloat(draw)*100;
      match.markets[marketsOfInterest.FT+"2"] = parseFloat(away)*100;
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
  console.log("Loaded "+matches.length+" matches.");
}

crawl();

var classes = {
  menuTabs : "tab-switch-btns",
  menuItem : "footer-menu-icon icon-footer-menu1",
  dateTab : "rj-carousel-item",
  matchLine : "rj-ev-list__ev-card__inner",
  matchInfo : "sl-CouponParticipantWithBookCloses",
  matchTime : "rj-ev-list__ev-card__section-item rj-ev-list__ev-card__time",
  matchName : "rj-ev-list__name-text",
  selectionRowOdds : "rj-ev-list__bet-btn__content rj-ev-list__bet-btn__odd"
}
