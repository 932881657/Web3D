import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  stageList: any = [[], [], []];
  selected: string[] = ['1-1', '2-1', '3-1'];
  labels: string[] = ['average', 'max', 'min'];
  options: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      }
    }
    
  };
  statMap:any={};

  constructor(private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.authService.adminCenter()
    .pipe(catchError((error: HttpErrorResponse) => {
      localStorage.clear();
      this.dataService.isLoggedIn.next(false);
      this.router.navigate(['login']);
      return EMPTY;
    })).subscribe(result => {
      let solutionMap = result.solutionMap;
      Object.keys(solutionMap).forEach((el) => {
        this.stageList[Number(el[0]) - 1].push(solutionMap[el]);
      });
      this.stageList.forEach((stage: any, stageIndex: number) => {
        stage.forEach((problem: any, index: number) => {
          let problemIndex = (stageIndex + 1) + '-' + (index + 1);
          ((stage as [])[index] as any) = {
            index: problemIndex,
          }
          this.statMap[problemIndex] = [
            { label: 'steps', data: this.getProblemData(problem.map((el:any)=>el.steps))},
            { label: 'num_inst', data: this.getProblemData(problem.map((el:any)=>el.numInst))}
          ]
        })
      })

    });
  }

  getProblemData(data:any){
    if(data.length === 0){
      return [0,0,0];
    }
    let total = 0;
    for(let temp of data){
      total += temp;
    }
    return [total / data.length, Math.max(...data), Math.min(...data)];
  }

}
