import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TabsModule } from 'ngx-bootstrap';
import { Web3Service, FlightDelayService } from './service/index';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TabsModule.forRoot(),
    ScrollToModule.forRoot()
  ],
  providers: [Web3Service, FlightDelayService],
  bootstrap: [AppComponent]
})
export class AppModule { }
