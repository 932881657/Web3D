import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from './angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/* Project Components */
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NavComponent } from './nav/nav.component';
import { WorldComponent } from './world/world.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DialogComponent } from './dialog/dialog.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { DataService } from './services/data.service';
import { RendererWorldComponent } from './world/renderer-world.component';
import { RendererProblemComponent } from './world/problem/renderer-problem.component';
import { AbstractObjectDirective } from './world/basics/abstract-object.directive';
import { SceneDirective } from './world/basics/scene.directive';
import { ProblemComponent } from './world/problem/problem.component';
import { LightDirective } from './world/basics/light.directive';
import { BallDirective } from './world/mesh/ball.directive';
import { GroundDirective } from './world/mesh/ground.directive';
import { FloorDirective } from './world/mesh/floor.directive';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { PlayerService } from './services/player.service';
import { InstructionDirective } from './world/mesh/instruction.directive';
import { ProblemBackendService } from './services/problem-backend.service';
import { UserCenterComponent } from './user-center/user-center.component';
import { ChatComponent } from './chat/chat.component';
import { CraftComponent } from './craft/craft.component';
import { SolutionTableComponent } from './solution-table/solution-table.component';
import { ManualComponent } from './manual/manual.component';
import { TableDialogComponent } from './table-dialog/table-dialog.component';
import { AdminComponent } from './admin/admin.component';

const config: SocketIoConfig = { url: environment.SOCKET_URL, options: { autoConnect: false } };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavComponent,
    WorldComponent,
    PageNotFoundComponent,
    DialogComponent,
    RendererWorldComponent,
    RendererProblemComponent,
    AbstractObjectDirective,
    SceneDirective,
    ProblemComponent,
    LightDirective,
    BallDirective,
    GroundDirective,
    InstructionDirective,
    FloorDirective,
    UserCenterComponent,
    ChatComponent,
    CraftComponent,
    SolutionTableComponent,
    ManualComponent,
    TableDialogComponent,
    AdminComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }, DataService, PlayerService, ProblemBackendService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
