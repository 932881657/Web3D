import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const baseUrl: string = environment.API_URL;

export interface Problem {
  title: string,
  description: string,
  /* 将以下三个字符串按分号split，得到一个问题初始状态的数组
    memory在split之后第一位表示可用的长度
  */
  input: string,
  output: string,
  memory: string,

  /*可以使用的指令 */
  instructions: Inst[],

  /* 答案 */
  solutions: Solution[]
}

export interface Inst {
  name: string,
  /* color可以不管，如果要用的话可取值为blue orange red green*/
  color: string,
  /* 初始状态下这两个值不用管，发送solve请求时需要指定这两个的值 */
  referTo: number,
  jumpTo: number,
}

/* 每一步的状态 */
export interface Status {
  /* 三个地方的值 */
  input: string[],
  output: string[],
  memory: string[],
  /* 表示手上的东西 */
  hand: string
}

export interface Solution {
  stage:number,
  number:number,
  steps: number,
  numInst: number,
  instructions: Inst[]
}

interface SolveResult {
  message: string,
  statusList: Status[]
}

interface ProblemResult {
  message: string,
  problem: Problem
}



@Injectable({
  providedIn: 'root'
})
export class ProblemBackendService {

  constructor(private http: HttpClient) { }

  getProblem(stage: string, number: string) {
    return this.http.post<ProblemResult>(baseUrl + '/problem', {
      stage, number
    });
  }

  sendSolution(stage: string, number: string, instructions: Inst[]) {
    let token: string = localStorage.getItem('token')!
    return this.http.post<SolveResult>(baseUrl + '/solve', {
      stage, number, token, instructions
    })
  }
}
