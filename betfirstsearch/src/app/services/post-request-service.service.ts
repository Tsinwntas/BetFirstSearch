import { Injectable } from '@angular/core';
import { tap } from  'rxjs/operators';
import { Observable, BehaviorSubject } from  'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostRequestServiceService {
  BFS_SERVER = "http://localhost:3000";

  constructor(private httpClient: HttpClient) { }

  search(query): Observable<any>{
    return this.httpClient.post(this.BFS_SERVER,query);
    // .pipe(
    //   tap((res: any)=>{
    //     console.log(res);
    //   },error=>console.log(error),()=>console.log("done"))
    // )
  }
}
