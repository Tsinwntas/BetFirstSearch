"use strict";
/*jshint esversion: 9 */

const $ = require('cheerio');
const url = 'https://en.stoiximan.com.cy/Upcoming24H/Soccer-FOOT/';
const fs = require("fs");
const puppeteer = require('puppeteer');
const utils = require('../services/utils');
var browser;
var page;
var checkInterval;
var matches = [];
var fullList = [];
const crawl = () => {
  (async () => {
    browser = await puppeteer.launch({
      headless: false, // if you run it headless, you will be kicked after the first time
      slowMo: 100,
    });
    page= await browser.newPage();
    console.log("Navigating to matches..")
    await page.goto(url);
    console.log("Mining..");
    await mine();
    console.log("Done.");
    utils.writeJsonToFile("stoiximan", matches);
    await browser.close();
  })();
};
async function mine(){
  matches = [];
  await page.waitForSelector('.'+classes.matchLine)
  return matches = await page.evaluate(async function(classes,marketsOfInterest){
    var matchLines = document.getElementsByClassName(classes.matchLine);
    var matches = [];
    getData();
    return matches;
    function getData(){
      let matches = [];
      Array.from(matchLines).forEach(match=>{
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
      return match.getElementsByClassName(classes.matchTime)[0].innerText.split(" ")[1];
    }
    function getMatchName(match){
      return match.getElementsByClassName(classes.matchName)[0].innerText.split(" - ");
    }
    function getSelectionOdd(match,index){
      return match.getElementsByClassName(classes.selectionRowOdds)[index].innerText;
    }
    function mapMatch(time,name,home,draw,away){
      let match = new Match(time,name[0],name[1]);
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
  matchLine : "table-row",
  matchTime : "date",
  matchName : "js-event-click event-title",
  selectionRowOdds : "market-selection"
}