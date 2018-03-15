import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { zhCnLocale } from 'ngx-bootstrap/locale';
defineLocale('zh-cn', zhCnLocale);
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

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
    BsDatepickerModule.forRoot(),
    ScrollToModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [Web3Service, FlightDelayService],
  bootstrap: [AppComponent]
})
export class AppModule { }
