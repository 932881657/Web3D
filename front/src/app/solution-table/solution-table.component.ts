import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Inst } from '../services/problem-backend.service';
import { Solution } from '../services/problem-backend.service';

export interface TableData {
  index: number,
  name: string,
  steps: number,
  numInst: number,
  instructions: Inst[]
}

@Component({
  selector: 'app-solution-table',
  templateUrl: './solution-table.component.html',
  styleUrls: ['./solution-table.component.css']
})
export class SolutionTableComponent {

  tableList: TableData[] = [];
  @Input() sourceList!: TableData[];
  cols: string[] = ['index', 'name', 'steps', 'numInst', 'instructions'];

  constructor() { }

}
