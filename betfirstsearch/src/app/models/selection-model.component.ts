export class SelectionModel {
  label : string;
  index : number;
  isSelected: boolean;
  value: number;

  constructor(label,index,value = 0){
    this.label = label;
    this.index = index;
    this.isSelected = false;
    this.value = value;
  }
}
