import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isAdmin: boolean = false;

  passwordHide = true;
  username = new FormControl('', [Validators.required]);
  password = new FormControl('', Validators.required);
  form: FormGroup = this.formBuilder.group({
    username: this.username,
    password: this.password,
  });

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private dataService: DataService) {

  }

  ngOnInit(): void {
  }

  openDialog(title: string, message: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '300px',
      data: { title: title, message: message }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (title === 'Welcome!') {
        this.dataService.isLoggedIn.next(true);
        if (this.isAdmin) {
          this.router.navigate(["/admin"]);
        } else {
          this.router.navigate(["/world/camp"]);
        }

      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // POST
      let username = this.username.value;
      this.authService.login(this.username.value, this.password.value)
        .pipe(catchError((error: HttpErrorResponse) => {
          this.openDialog('Whoops!', 'Something unexpected happened. Check your network connectivity');
          return throwError(() => new Error('Something bad happened!'))
        }))
        .subscribe(result => {
          if (result.token) {
            // success
            localStorage.setItem('token', result.token);
            localStorage.setItem('username', username);
            localStorage.setItem('modelName', result.modelName);
            if ('Admin' === result.role) {
              this.isAdmin = true;
            }
            this.openDialog('Welcome!', 'Welcome to Machine Witness!');
          } else {
            // failed
            this.openDialog('Sorry!', result.message);
          }
        });
    }
  }

}
