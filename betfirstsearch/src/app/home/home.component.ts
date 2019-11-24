import { Component, OnInit} from '@angular/core';
import { SelectionModel } from '../models/selection-model.component';
import { ResultsDataModel } from '../models/results-data-model';
import {Sort} from '@angular/material/sort';
import { WebsiteModel } from '../models/website-model';
import { PostRequestServiceService } from '../services/post-request-service.service';

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

  constructor(private postRequestService: PostRequestServiceService) { 
  }

  ngOnInit() {
    this.websites = [new WebsiteModel("bet365"), new WebsiteModel("stoiximan"), new WebsiteModel("winmasters")];
    this.selections = [new SelectionModel("1",0),new SelectionModel("X",1), new SelectionModel("2",2)];
    this.setResultData([]);
  }
  
  setResultData(data){
    this.resultData = data;
    this.sortedResultData = this.resultData.slice();
  }


  toggleWebsite(index){
    this.websites[index].isSelected = !this.websites[index].isSelected;
  }
  
  toggleSelection(index){
    this.selections[index].isSelected = !this.selections[index].isSelected;
  }

  isWebsiteSelected(index){
    return this.websites[index].isSelected;
  }

  isSelectionSelected(index){
    return this.selections[index].isSelected;
  }

  search(){
    let searchQuery = JSON.stringify({
      "bool" : {
        "must" : [
          {"bool" : this.getMatchNameQuery()},
          {"bool" : this.getWebsiteQuery()},
          {"bool" : this.getOddsQuery()}
        ]
      }
    })
    console.log(searchQuery);
    console.log("*****************");
    this.postRequestService.search(searchQuery).subscribe(data=>{
      console.log(data);
      this.setResultData(this.postRequestService.mapResults(data))  ;
    });
  }
  getMatchNameQuery(){
    return {
      "must": [
        {"wildcard": {"name": "*"+(this.searchInput ? this.searchInput.toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"*").replace(/[*]*$/g,"")+"*" : "")}},
        // {"wildcard": {"away": "*"+(this.searchInput ? this.searchInput+"*" : "")}}
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
    let gte = this.oddsBottomLimit ? this.oddsBottomLimit*1000 : 0;
    let lte = this.oddsUpperLimit ? this.oddsUpperLimit*1000+5 : 1000000;

    let selectedOdds = [];
    this.selections.forEach(s => {if(s.isSelected) selectedOdds.push(s)});
    return {"should" : this.getOddsQueryByArray(selectedOdds.length == 0 ? this.selections : selectedOdds, gte, lte)}

  }

  getOddsQueryByArray(array, gte, lte){
    let query = [];
    array.forEach((s: SelectionModel)=>{
      let rangeForSelection = {"range":{}};
      rangeForSelection.range["markets.FT"+s.label] = {
        lte: lte,
        gte: gte
      }

      query.push(rangeForSelection);
    })
    return query;
  }

  formatMatchName(match){
    return match.home + " vs " + match.away;
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
        case 'time': return compare(a.time, b.time, isAsc);
        case 'match': return compare(this.formatMatchName(a), this.formatMatchName(b), isAsc);
        case '1': return compare(a.selections[0].value, b.selections[0].value, isAsc);
        case 'X': return compare(a.selections[1].value, b.selections[1].value, isAsc);
        case '2': return compare(a.selections[2].value, b.selections[2].value, isAsc);
        case 'site': return compare(a.website, b.website, isAsc);
        default: return 0;
      }
    });
  }
  
}

function compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
