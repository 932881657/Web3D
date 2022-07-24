import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {
    public isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public isInProblem: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}