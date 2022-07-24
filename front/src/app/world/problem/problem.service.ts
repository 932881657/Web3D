import { Injectable , EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  public problemEventEmitter:any;

  constructor() { 
    this.problemEventEmitter = new EventEmitter();
  }
}
