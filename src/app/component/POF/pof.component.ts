import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { SohoBusyIndicatorDirective } from 'ids-enterprise-ng';
import { Subscription } from 'rxjs';
import { BasicGridComponent } from 'src/app/basic/grid/basicgrid.component';
import { BasicAPIService } from 'src/app/services/basicAPI.service';


@Component({
   selector: 'cmp-pof',
   templateUrl: './pof.component.html',
   styleUrls: ['./pof.component.css']
})
export class pofComponent extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @ViewChild('basicdatagridListePOF') basicdatagridListePOF: BasicGridComponent;

   @Input() ITNOSelected: string;
   @Input() WHLOSelected: string;
   @Input() USID: string;
   SUNO: string;
   PLDT: number;
   PPQT: number;
   FACI: string;

   dataselect: Object[] = [];
   lineSelected: any = '';
   isBusy = false;
   disabledBTenrgistrer = false;


   columnsListePOF = [
      { id: 'ID', field: 'ID', name: '', hidden: true, sortable: false, formatter: Soho.Formatters.SelectionCheckbox },
      { id: 'PLPN', field: 'PLPN', name: 'N° ordre', width: 20, sortable: false, filterType: 'text' },
      { id: 'PLDT', field: 'PLDT', name: 'date planifiée', width: 20, sortable: false, filterType: 'text' },
      { id: 'PPQT', field: 'PPQT', name: 'Qté  planiée', width: 10, sortable: false, filterType: 'text' },
      { id: 'RESP', field: 'RESP', name: 'Responsable', width: 20, sortable: false, filterType: 'text' },


   ];

   optionsDataGridListePof: SohoDataGridOptions = {
      selectable: 'single' as SohoDataGridSelectable,
      filterable: false,
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
      columns: this.columnsListePOF,
      dataset: [],
      emptyMessage: {
         title: 'Aucune donnée',
         icon: 'icon-empty-no-data'
      }
   };


   constructor(private APIService: BasicAPIService) {
      super('pof');
   }

   ngOnInit(): void {
      this.logWarning('chargement Panel POA');
   }


   createPOF() {
      this.getFACI(this.WHLOSelected);


   }

   getListPOF() {
      let qry = "ROPLPN, ROPLDT, ROPPQT, RORESP from MMOPLP where ROPRNO = '" + this.ITNOSelected + "' and ROPLDT = " + this.PLDT;
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         SEPC: ';',
         QERY: qry
      };
      inputFields = newrecord;
      let subscription: Subscription;


      subscription = this.APIService.GetFieldValue('EXPORTMI', 'Select', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            for (let i = 0; i < response.items.length; i++) {
               const valeurs = response.items[i].REPL.split(";");
               response.items[i].PLPN = valeurs[0];
               response.items[i].PLDT = valeurs[1];
               response.items[i].PPQT = valeurs[2];
               response.items[i].RESP = valeurs[3];
            }
            this.basicdatagridListePOF.datagrid.dataset = response.items;
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

   getFACI(WHLO: string) {
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];
      let newrecord = {
         WHLO: WHLO,
      };
      inputFields = newrecord;
      let subscription: Subscription;
      subscription = this.APIService.GetFieldValue('MMS005MI', 'GetWarehouse', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            reponse = response.items;
            console.log(response);
            this.callPPS170MI(reponse[0].FACI);

         }, error: (error) => {
            (this.busyIndicator as any).activated = false;
            this.logError('Failed to load items :' + JSON.stringify(error));
            alert(JSON.stringify(error));
            subscription.unsubscribe();
         }, complete: () => {
            subscription.unsubscribe();
            (this.busyIndicator as any).activated = false;
         }
      });
   }

   callPPS170MI(FACI: string) {

      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         FACI: FACI,
         WHLO: this.WHLOSelected,
         PRNO: this.ITNOSelected,
         PPQT: this.PPQT,
         PLDT: this.PLDT,
         STRT: 100,
         PLHM: 1200,
         PSTS: 10,
         SIMD: 0
      };
      inputFields = newrecord;
      let subscription: Subscription;


      subscription = this.APIService.GetFieldValue('PMS170MI', 'CrtPlannedMO', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            alert("Création de POF effectuée")
            this.getListPOF();
         }, error: (error) => {
            (this.busyIndicator as any).activated = false;
            this.logError('Failed to load items :' + JSON.stringify(error));
            alert(JSON.stringify(error));
            subscription.unsubscribe();
         }, complete: () => {
            subscription.unsubscribe();
            (this.busyIndicator as any).activated = false;
         }
      });
   }
}
