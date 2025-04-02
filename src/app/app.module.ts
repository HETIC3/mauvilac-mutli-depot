import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Log } from '@infor-up/m3-odin';
import { M3OdinModule } from '@infor-up/m3-odin-angular';
import { SohoComponentsModule } from 'ids-enterprise-ng'; // TODO Consider only importing individual SoHo modules in production
import { AppComponent } from './app.component';
import { BasicAPIService } from './services/basicAPI.service';
import { IdmDataService } from './services/idm-data.service';
import { DropdownComponent } from './basic/dropdown/dropdown.component';
import { BasicGridComponent } from './basic/grid/basicgrid.component';
import { multidepotComponent } from './component/multidepot/multidepot.component';
import { poaComponent } from './component/POA/poa.component';
import { pofComponent } from './component/POF/pof.component';
import { stockEcheanceComponent } from './stockEcheance/stockEcheance.component';
import { MMS80component } from './component/MMS080/MMS080.component';
import { totauxComponent } from './component/Totaux/totaux.component';
import { ModalDialogOneColumnComponent } from './basic/modal-dialog/ModalDialogOneColumn.component';
import { ModalDialogAllColumnComponent } from './basic/modal-dialog/ModalDialogAllColumn.component';

@NgModule({
   declarations: [
      AppComponent,
      DropdownComponent,
      BasicGridComponent,
      multidepotComponent,
      poaComponent,
      pofComponent,
      stockEcheanceComponent,
      MMS80component,
      ModalDialogOneColumnComponent,
      ModalDialogAllColumnComponent,
      totauxComponent
   ],
   imports: [
      BrowserModule,
      FormsModule,
      SohoComponentsModule,
      M3OdinModule,
      ReactiveFormsModule,
   ],
   providers: [
      BasicAPIService,
      IdmDataService,
      {
         provide: LOCALE_ID,
         useValue: 'en-US',
      },
      {
         provide: APP_INITIALIZER,
         multi: true,
         useFactory: (locale: string) => () => {
            Soho.Locale.culturesPath = 'assets/ids-enterprise/js/cultures/';
            return Soho.Locale.set(locale).catch(err => {
               Log.error('Failed to set IDS locale', err);
            });
         },
         deps: [LOCALE_ID],
      }
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
