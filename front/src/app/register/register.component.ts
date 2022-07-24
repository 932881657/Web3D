import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, } from '@angular/forms';
import { ConfirmValidParentMatcher, CustomValidators } from './validate';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  passwordHide = true;
  username = new FormControl('', [Validators.required, Validators.minLength(4)]);
  password = new FormControl('', [Validators.required, Validators.minLength(6)]);
  confirm = new FormControl('', [Validators.required]);
  modelName = new FormControl('blueBot');
  form: FormGroup;
  errorStateMatcher = new ConfirmValidParentMatcher();

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    public dialog: MatDialog,
    private router: Router) {
    this.form = this.formBuilder.group({
      username: this.username,
      modelName: this.modelName,
      passwordGroup: this.formBuilder.group({
        password: this.password,
        confirm: this.confirm
      }, { validator: CustomValidators.childrenEqual })
    });
  }

  ngOnInit(): void {
  }

  getUsernameErrorMsg() {
    if (this.username?.hasError('required')) {
      return 'You must enter your username!';
    }
    return this.username?.hasError('minlength') ? 'Your username must contain at least 4 characters' : '';
  }

  getPasswordErrorMsg() {
    if (this.password?.hasError('required')) {
      return 'You must enter your password!';
    }
    return this.password?.hasError('minlength') ? 'Your password must contain at least 6 characters' : '';
  }

  getConfirmErrorMsg() {
    if (this.confirm?.hasError('required')) {
      return 'You must confirm your password!';
    }
    return this.form.get('passwordGroup')?.hasError('childrenNotEqual') ? 'It does not match your previous input!' : '';
  }

  openDialog(title: string, message: string): void {
    console.log(title, message);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '300px',
      data: { title: title, message: message }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (title === 'Congratulations!') {
        this.router.navigate(["login"])
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // POST
      this.authService.register(this.username.value, this.password.value, this.modelName.value)
        .pipe(catchError((error: HttpErrorResponse) => {
          this.openDialog('Whoops!', 'Something unexpected happened. Check your network connectivity');
          return throwError(() => new Error('Something bad happened!'))
        }))
        .subscribe(result => {
          if (result.id) {
            this.openDialog('Congratulations!', 'You have successfully registered!');
          } else {
            this.openDialog('Registration Failed!', result.message);
          }
        });
    }
  }
}