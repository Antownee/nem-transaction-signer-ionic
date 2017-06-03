import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { NemService } from "../services/nem.service";
import { ModalContentPage } from "../pages/home/modal";
import { QRCodeModule } from 'angular2-qrcode';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ModalContentPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    QRCodeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ModalContentPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NemService
  ],
  
})
export class AppModule {}
