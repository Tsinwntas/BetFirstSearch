import { SelectionModel } from './selection-model.component';

export class ResultsDataModel {
  time: Date;
  home: string;
  away: string;
  selections: SelectionModel[];
  website: string;

  constructor(time,home,away){
    this.time = time;
    this.home = home;
    this.away = away;
    this.selections = [];
  }
}
