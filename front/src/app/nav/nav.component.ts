import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  username: string = localStorage.getItem('username') as string;
  isLoggedIn: boolean;
  mapId!: string;

  constructor(private router: Router, private route: ActivatedRoute, private dataService: DataService) {
    this.dataService.isLoggedIn.subscribe(val => {
      this.isLoggedIn = val;
      this.username = localStorage.getItem('username') as string;
    });

    if (localStorage.getItem('token')) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationEnd
      )
    ).subscribe(event => {
      let temp = (event as any).url.split('?')[0].split('/').pop();
      this.mapId = temp ? temp : 'camp';
    })

  }

  logout(): void {
    localStorage.clear();
    this.isLoggedIn = false;
    this.router.navigate(['login']);
  }
}
