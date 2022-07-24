import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Solution } from '../services/problem-backend.service';

export interface TableDialogData {
  title: string,
  message: string,
  hasSolutions: boolean,
  solutions: Solution[]
}

@Component({
  selector: 'app-table-dialog',
  templateUrl: './table-dialog.component.html',
  styleUrls: ['./table-dialog.component.css']
})
export class TableDialogComponent implements OnInit {

  cols: string[] = ['index', 'steps', 'numInst'];
  dataSource: {
    index: number,
    steps: number,
    numInst: number
  }[] = [];

  constructor(
    public dialogRef: MatDialogRef<TableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TableDialogData
  ) {
    this.dialogRef.disableClose = true;
    data.solutions.forEach((solution, index) => {
      this.dataSource.push({
        index: index,
        steps: solution.steps,
        numInst: solution.numInst
      })
    })
  }

  ngOnInit() {
  }

}
