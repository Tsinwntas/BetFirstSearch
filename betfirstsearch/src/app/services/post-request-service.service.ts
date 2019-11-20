import { Injectable } from '@angular/core';
import { tap } from  'rxjs/operators';
import { Observable, BehaviorSubject } from  'rxjs';
import { HttpClient } from '@angular/common/http';
import { ResultsDataModel } from '../models/results-data-model';
import { SelectionModel } from '../models/selection-model.component';

@Injectable({
  providedIn: 'root'
})
export class PostRequestServiceService {
  BFS_SERVER = "http://localhost:3000";

  constructor(private httpClient: HttpClient) { }

  search(query): Observable<any>{
    return this.httpClient.post(this.BFS_SERVER,query);
  }
  mapResults(results){
    let mappedResults = [];
    results.forEach(result => {
      let match = result["_source"];
      let currentResultModel = new ResultsDataModel(match.time,match.home,match.away);
      currentResultModel.website = match.label;
      currentResultModel.selections[0]=new SelectionModel("1", 0, match.markets.FT1/1000);
      currentResultModel.selections[1]=new SelectionModel("X", 1, match.markets.FTX/1000);
      currentResultModel.selections[2]=new SelectionModel("2", 2, match.markets.FT2/1000);
      mappedResults.push(currentResultModel)
    });
    return mappedResults;
  }
}
