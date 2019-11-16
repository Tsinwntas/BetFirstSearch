"use strict";
/*jshint esversion: 9 */

const $ = require('cheerio');
const url = 'https://ubet.com.cy/sports';
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
    console.log("Setting language if necessary..")
    await setLanguage();
    console.log("Navigating to next 24h matches..")
    await navigateToNext24HMatches();
    console.log("Mining..");
    await mine();
    console.log("Done.");
    utils.writeJsonToFile("ubet", matches);
    await browser.close();
    let done = new Date();
    console.log("Runtime: "+((done.getTime()-start.getTime())/1000.0) + "s");
  })();
};
async function setLanguage(){
  await page.waitForSelector('.'+classes.language);
  let isNecessary = await page.evaluate(async function(classes){
    if(document.getElementsByClassName(classes.languageGreek).length > 0){
      document.getElementsByClassName(classes.languageDropdown)[0].click();
      return true;
    }
  },classes)
  console.log(isNecessary)
  if(isNecessary){
    await page.waitForSelector('.'+classes.languageEnglish);
    await page.evaluate(async function(classes){
      return document.getElementsByClassName(classes.languageEnglish)[0].click();
    },classes);
    await utils.sleep(1000);
    await page.waitForSelector('.'+classes.matchLine);
  }
  return 1;
}
async function navigateToNext24HMatches(){
  await page.waitForSelector('.'+classes.next24HTab);
  await page.evaluate(async function(classes){
    document.getElementsByClassName(classes.next24HTab)[0].click();
    await sleep(500);
    return document.getElementsByClassName(classes.menuItem)[0].getElementsByClassName(classes.checkbox)[0].click();

    async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  },classes);
}
async function mine(){
  await page.waitForSelector('.'+classes.matchLine)
  matches = await page.evaluate(async function(classes,marketsOfInterest){
    var matchLines = Array.from(document.getElementsByClassName(classes.matchLine));
    var matches = [];
    getData();
    return matches;

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
      return [match.getElementsByClassName(classes.matchTeam)[0].innerText, match.getElementsByClassName(classes.matchTeam)[1].innerText]
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
  },classes,utils.getMarketsOfInterest());
  console.log("Loaded "+matches.length+" matches.");
}
crawl();

var classes = {
  language: "selected-language",
  languageEnglish: "lang-en",
  languageGreek: "lang-el",
  languageDropdown : "select-open-dropdown",
  next24HTab : "period-select-24h",
  next24HTabSelected: "period-select-option period-select-24h selected",
  menuItem : "left-menu-item",
  checkbox: "sport-menu-select",
  matchLine : "match-sport-soccer",
  matchTime : "match-time-hour",
  matchTeam : "team",
  selectionRowOdds : "sel-odds"
}
