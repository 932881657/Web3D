import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY } from 'rxjs';
import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { TableDialogComponent, TableDialogData } from '../table-dialog/table-dialog.component';
import { ProblemBackendService } from '../services/problem-backend.service';


export interface Problem {
  position: number[],
  rotationY: number,
  ifUserDefined: boolean,
  name: string
}

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {
  loaded: boolean = false;
  mapId!: string;
  mapSolved!: boolean;
  problems: Problem[] = [];
  position: number[] = [];
  instructions: string[] = [];
  isInProblem: boolean = false;
  canOpenDialog:boolean = true;

  stage='1';
  number='1';

  constructor(private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private problemService: ProblemBackendService) { }

  ngOnInit(): void {
    let temp = this.route.snapshot.routeConfig?.path;
    this.mapId = temp ? temp : 'camp';
    this.getProblems();
  }

  getProblems() {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['login']);
      return;
    }
    this.authService.mapProblems(this.mapId)
      .pipe(catchError(err => {
        localStorage.clear();
        this.dataService.isLoggedIn.next(false);
        this.router.navigate(['login']);
        return EMPTY;
      })).subscribe((result: any) => {
        this.mapSolved = result.mapSolved;
        this.instructions = result.instructions;
        for (let temp of result.problems) {
          let worldInfo: string = temp.worldInfo;
          let numbers = worldInfo.split(';').map(Number);
          this.problems.push({
            position: [numbers[0], numbers[1], numbers[2]],
            rotationY: numbers[3],
            ifUserDefined: temp.ifUserDefined,
            name: temp.stage + '-' + temp.number
          });
        }
      });
  }

  setLoaded(loaded: boolean) {
    this.loaded = loaded;
  }

  setPosition(position: number[]) {
    this.position = position;
  }

  openProblem(name: string) {
    if (this.canOpenDialog) {
      this.canOpenDialog = false;
      let splits = name.split('-');
      this.problemService.getProblem(splits[0], splits[1]).subscribe(result => {
        let solutions = result.problem.solutions;
        let hasSolutions = solutions.length !== 0;
        let tableData: TableDialogData = {
          hasSolutions: hasSolutions,
          message: hasSolutions ? 'ignored' : 'No one has solved this problem yet',
          solutions: solutions,
          title: 'Problem ' + name + ' Players\' solutions'
        };
        const dialogRef = this.dialog.open(TableDialogComponent, {
          width: '500px',
          data: tableData
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.isInProblem = true;
            this.stage = splits[0];
            this.number = splits[1];
          }else {
            this.canOpenDialog = true;
          }
        });
      });
    }

  }

  goBack(): void {
    this.isInProblem = false;
    this.canOpenDialog = true
  }
}
