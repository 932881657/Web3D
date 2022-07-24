import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { UserCenterComponent } from './user-center/user-center.component';
import { ProblemComponent } from './world/problem/problem.component';
import { WorldComponent } from './world/world.component';

const routes: Routes = [
  {
    path: 'world', children: [
      { path: 'forest', component: WorldComponent },
      { path: 'camp', component: WorldComponent },
      { path: 'island', component: WorldComponent },
      { path: '**', component: PageNotFoundComponent }
    ]
  },
  { path: '', redirectTo: '/world/camp', pathMatch: 'full' },
  { path: 'problem', component: ProblemComponent },
  { path: 'center', component: UserCenterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component:AdminComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
