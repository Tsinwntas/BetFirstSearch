export class SelectionModel {
  label : string;
  index : number;
  isSelected: boolean;

  constructor(label,index){
    this.label = label;
    this.index = index;
    this.isSelected = true;
  }
}
