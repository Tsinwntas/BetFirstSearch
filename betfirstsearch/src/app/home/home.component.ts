import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '../models/selection-model.component';
import { ResultsDataModel } from '../models/results-data-model';

import {Sort} from '@angular/material/sort';
import { WebsiteModel } from '../models/website-model';

export interface Dessert {
  calories: number;
  carbs: number;
  fat: number;
  name: string;
  protein: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  websites: WebsiteModel[];
  selections: SelectionModel[];
  searchInput: string;
  oddsUpperLimit: number;
  oddsBottomLimit: number;

  resultData: ResultsDataModel[];
  sortedResultData: ResultsDataModel[];

  constructor() { 
  }

  ngOnInit() {
    this.websites = [new WebsiteModel("bet365"), new WebsiteModel("stoiximan"), new WebsiteModel("winmasters")];
    this.selections = [new SelectionModel("1",0),new SelectionModel("X",1), new SelectionModel("2",2)];
    this.resultData = [];
    this.sortedResultData = this.resultData.slice();
  }
  toggleSelection(index){
    this.selections[index].isSelected = !this.selections[index].isSelected;
  }

  search(){
    let searchQuery = JSON.stringify({
      "bool" : {
        "must" : [
          {"bool" : this.getMatchNameQuery()},
          // {"bool" : this.getWebsiteQuery()},
          // {"bool" : this.getOddsQuery()}
        ]
      }
    })
    console.log(searchQuery);
  }
  getMatchNameQuery(){
    return {
      "should": [
        {"wildcard": {"home": "*"+(this.searchInput ? this.searchInput+"*" : "")}},
        {"wildcard": {"away": "*"+(this.searchInput ? this.searchInput+"*" : "")}}
      ]
    }
  }

  getWebsiteQuery(){
    let selectedWebsites = [];
    this.websites.forEach(w => {if(w.isSelected) selectedWebsites.push(w)});
    return {"should": this.getWebsiteQueryByArray(selectedWebsites.length == 0 ? this.websites : selectedWebsites)}; 
  }

  getWebsiteQueryByArray(array){
    let query = [];
    array.forEach(w=>{
      query.push({"match" : {"label" : w.label}});
    });
    return query;
  }

  getOddsQuery() {
    let query = [];
    let gte = this.oddsBottomLimit ? this.oddsBottomLimit : 0;
    let lte = this.oddsUpperLimit ? this.oddsUpperLimit : 1000;

    let selectedOdds = [];
    this.selections.forEach(s => {if(s.isSelected) selectedOdds.push(s)});
    return {"should" : this.getOddsQueryByArray(selectedOdds.length == 0 ? this.selections : selectedOdds, gte, lte)}

  }

  getOddsQueryByArray(array, gte, lte){
    let query = [];
    array.forEach((s: SelectionModel)=>{
      query.push({
        "range":{
          "FT.0":{
            "lte" : s.index == 0 ? lte: 1000,
            "gte" : s.index == 0 ? gte: 0
          }
        }
      })
    })
    return query;
  }

  sortData(sort: Sort) {
    const data = this.resultData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedResultData = data;
      return;
    }

    this.sortedResultData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        // case 'name': return compare(a.name, b.name, isAsc);
        // case 'calories': return compare(a.calories, b.calories, isAsc);
        // case 'fat': return compare(a.fat, b.fat, isAsc);
        // case 'carbs': return compare(a.carbs, b.carbs, isAsc);
        // case 'protein': return compare(a.protein, b.protein, isAsc);
        default: return 0;
      }
    });
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
