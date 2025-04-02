import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { MIRecord, MIResponse } from '@infor-up/m3-odin/dist/mi/runtime';
import { SohoBusyIndicatorDirective } from 'ids-enterprise-ng';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { BasicGridComponent } from 'src/app/basic/grid/basicgrid.component';
import { BasicAPIService } from 'src/app/services/basicAPI.service';


@Component({
   selector: 'cmp-MMS080',
   templateUrl: './MMS080.component.html',
   styleUrls: ['./MMS080.component.css']
})


export class MMS80component extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @ViewChild('basicdatagridListeStockMMS080') basicdatagridListeStockMMS080: BasicGridComponent;

   @Input() ITNOSelected: string;
   @Input() USERWHLO: string;

   dataselect: Object[] = [];
   lineSelected: any = '';
   isBusy = false;

   //Filtre article (deux onglets)
   ITNO_2: string = 'A0007366';
   busyItem = true;
   SearchItem: any[];

   //Valeur pour remplir la datagrid
   dataset: any[] = [];
   firstMonthRecepQty: number = 0;

   columnsListeStockMMS080 = [
      { id: 'ID', field: 'ID', name: '', hidden: true, sortable: false, formatter: Soho.Formatters.SelectionCheckbox },
      { id: 'ITNO', field: 'ITNO', name: 'Code article', width: 30, sortable: false, filterType: 'text' },
      { id: 'PLDT', field: 'PLDT', name: 'Date planifié', width: 30, sortable: false, filterType: 'text' },
      { id: 'TRQT', field: 'TRQT', name: 'Qté transaction', width: 30, sortable: false, filterType: 'text' },
   ];

   optionsDataGridListeStockMMS080: SohoDataGridOptions = {
      selectable: 'single' as SohoDataGridSelectable,
      filterable: true,
      filterWhenTyping: false,
      columnReorder: true,
      editable: true,
      disableRowDeactivation: true,
      clickToSelect: true,
      alternateRowShading: true,
      cellNavigation: false,
      rowHeight: 'extra-small' as SohoDataGridRowHeight,
      idProperty: 'ID',
      paging: true,
      pagesize: 5,
      indeterminate: false,
      columns: this.columnsListeStockMMS080,
      dataset: [],
      emptyMessage: {
         title: 'Aucune donnée',
         icon: 'icon-empty-no-data'
      },
   };



   constructor(private APIService: BasicAPIService) {
      super('MMS080');
   }

   ngOnInit(): void {
      this.logWarning('chargement Panel multiDépôt');
      //this.getListWHLO();
   }

   loadListMMS080(ITNO: string, WHLO: string) {
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];

      let newrecord = {
         WHLO: WHLO,
         ITNO: ITNO
      };

      inputFields = newrecord;
      let subscription: Subscription;
      subscription = this.APIService.GetFieldValue('MMS080MI', 'SelMtrlTrans', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            this.basicdatagridListeStockMMS080.datagrid.dataset = response.items;
         }, error: (error) => {
            (this.busyIndicator as any).activated = false;
            this.logError('Failed to load items :' + JSON.stringify(error));
            subscription.unsubscribe();
         }, complete: () => {
            subscription.unsubscribe();
            (this.busyIndicator as any).activated = false;
         }
      });

   }
}
