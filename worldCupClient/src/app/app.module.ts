import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { zhCnLocale } from 'ngx-bootstrap/locale';
defineLocale('zh-cn', zhCnLocale);
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { LocalStorageModule } from '@ngx-pwa/local-storage';
import { DlDateTimePickerDateModule } from 'angular-bootstrap-datetimepicker';

import {
    Web3Service, LoadingService, LocalOrderService,
    WCCService, LocalActionService, AlertService
} from './service/index';

import { DelayRatePipe } from './shared/pipes';

import { AppComponent } from './app.component';
import { TransactionPipe } from './service/pipe/transaction.pipe';
import { TransactionUrlPipe } from './service/pipe/transaction-url.pipe';
import { ClaimStatusPipe } from './service/pipe/claim-status.pipe';
import { FifaHomeComponent } from './fifa/home/home.component';
import { FifaAdminComponent } from './fifa/admin/admin.component';
import { GameTypePipe } from './service/pipe/game-type.pipe';
import { GameStatusPipe } from './service/pipe/game-status.pipe';
import { WeekdayPipe } from './service/pipe/weekday.pipe';
import { FromWeiPipe } from './service/pipe/fromWei.pipe';
import { CourtComponent } from './fifa/court/court.component';
import { OrderComponent } from './fifa/order/order.component';
import { ExchangeComponent } from './fifa/exchange/exchange.component';
import { ShowDatePipe } from './service/pipe/show-date.pipe';
import { NationFlagPipe } from './service/pipe/nation-flag.pipe';
import { ChartComponent } from './fifa/chart/chart.component';
import { TransComponent } from './fifa/trans/trans.component';
import { ContactComponent } from './fifa/contact/contact.component';
import { FaqComponent } from './fifa/faq/faq.component';


@NgModule({
    declarations: [
        AppComponent,
        FromWeiPipe,
        DelayRatePipe,
        TransactionPipe,
        TransactionUrlPipe,
        ClaimStatusPipe,
        FifaHomeComponent,
        FifaAdminComponent,
        GameTypePipe,
        GameStatusPipe,
        WeekdayPipe,
        CourtComponent,
        OrderComponent,
        ExchangeComponent,
        ShowDatePipe,
        NationFlagPipe,
        ChartComponent,
        TransComponent,
        ContactComponent,
        FaqComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        AppRoutingModule,
        HttpClientModule,
        BsDatepickerModule.forRoot(),
        ScrollToModule.forRoot(),
        ModalModule.forRoot(),
        AlertModule.forRoot(),
        ButtonsModule.forRoot(),
        ProgressbarModule.forRoot(),
        TimepickerModule.forRoot(),
        TooltipModule.forRoot(),
        TabsModule.forRoot(),
        CollapseModule.forRoot(),
        FormsModule,
        LocalStorageModule,
        ReactiveFormsModule,
        DlDateTimePickerDateModule
    ],
    providers: [Web3Service, LoadingService, LocalOrderService, WCCService, LocalActionService, AlertService],
    bootstrap: [AppComponent]
})
export class AppModule { }
