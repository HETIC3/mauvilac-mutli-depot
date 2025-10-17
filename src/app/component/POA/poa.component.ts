import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { SohoBusyIndicatorDirective } from 'ids-enterprise-ng';
import { ApplicationService } from '@infor-up/m3-odin-angular';
import { Subscription } from 'rxjs';
import { BasicGridComponent } from 'src/app/basic/grid/basicgrid.component';
import { BasicAPIService } from 'src/app/services/basicAPI.service';


@Component({
   selector: 'cmp-poa',
   templateUrl: './poa.component.html',
   styleUrls: ['./poa.component.css']
})
export class poaComponent extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @ViewChild('basicdatagridListePOA') basicdatagridListePOA: BasicGridComponent;

   @Input() ITNOSelected: string;
   @Input() WHLOSelected: string;
   @Input() USID: string;
   SUNO: string;
   PLDT: string;
   PPQT: number;
   WHLO: string;

   //Filtre Dépôt
   ListWHLO: any[] = [];

   dataselect: Object[] = [];
   lineSelected: any = '';
   isBusy = false;
   disabledBTenrgistrer = false;


   columnsListePOA = [
      { id: 'ID', field: 'ID', name: '', hidden: true, sortable: false, formatter: Soho.Formatters.SelectionCheckbox },
      { id: 'WHLO', field: 'WHLO', name: 'Dépôt', width: 10, sortable: false, filterType: 'text' },
      { id: 'ITNO', field: 'ITNO', name: 'Code article', width: 20, sortable: false, filterType: 'text' },
      { id: 'SUNO', field: 'SUNO', name: 'Fournisseur', width: 20, sortable: false, filterType: 'text' },
      { id: 'PURC', field: 'PURC', name: 'Demandeur', width: 10 },
      { id: 'DLDT', field: 'DLDT', name: 'Date planif', width: 20 },
      { id: 'PPQT', field: 'PPQT', name: 'Qte planif', width: 10 },

   ];

   optionsDataGridListePoa: SohoDataGridOptions = {
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
      columns: this.columnsListePOA,
      dataset: [],
      emptyMessage: {
         title: 'Aucune donnée',
         icon: 'icon-empty-no-data'
      }
   };




   constructor(private APIService: BasicAPIService, private applicationService: ApplicationService) {
      super('poa');
   }

   ngOnInit(): void {
      this.logWarning('chargement Panel POA');
      this.getListWHLO();
   }

   getListWHLO() {
      this.ListWHLO = [];
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];

      let newrecord = {

      };

      inputFields = newrecord;
      let subscription: Subscription;
      subscription = this.APIService.GetFieldValue('MMS005MI', 'LstWarehouses', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            this.ListWHLO = response.items;

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


   getSUNO() {
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         WHLO: this.WHLO,
         ITNO: this.ITNOSelected,
      };
      inputFields = newrecord;
      let subscription: Subscription;


      subscription = this.APIService.GetFieldValue('MMS200MI', 'GetItmWhsBasic', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            this.SUNO = response.item.SUNO;
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

   createPOA() {

      const jour = this.PLDT.substring(0, 2);
      const mois = this.PLDT.substring(2, 4);
      const annee = this.PLDT.substring(4, 6);

      // Supposons que l'année est dans les années 2000 (20xx)
      const anneeComplete = "20" + annee;

      const PLDT_2 = `${anneeComplete}${mois}${jour}`;

      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         WHLO: this.WHLO,
         ITNO: this.ITNOSelected,
         SUNO: this.SUNO,
         PPQT: this.PPQT,
         PLDT: PLDT_2,
         PSTS: 10,


      };
      inputFields = newrecord;
      let subscription: Subscription;


      subscription = this.APIService.GetFieldValue('PPS170MI', 'CrtPOP', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            alert("Création de POA effectuée")
            this.getListPOA(response.item.PLPN);
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

   UpdatePOA() {
      if (this.ITNOSelected !== '') {
         let query: string = 'mforms://_automation?data=%3c%3fxml+version%3d%221.0%22+encoding%3d%22utf-8%22%3f%3e%3csequence%3e%3cstep+command%3d%22RUN%22+value%3d%22PPS170%22+%2f%3e%3cstep+command%3d%22AUTOSET%22%3e%3cfield+name%3d%22WWQTTP%22%3e70%3c%2ffield%3e%3c%2fstep%3e%3cstep+command%3d%22AUTOSET%22%3e%3cfield+name%3d%22W1OBKV%22%3e'
            + this.ITNOSelected +
            '%3c%2ffield%3e%3c%2fstep%3e%3cstep+command%3d%22KEY%22+value%3d%22ENTER%22+%2f%3e%3c%2fsequence%3e';
         this.applicationService.launch(query);
      }
   }

   getListPOA(PLPN: string) {
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         PLPN: PLPN
      };
      inputFields = newrecord;
      let subscription: Subscription;


      subscription = this.APIService.GetFieldValue('PPS170MI', 'LstPlannedPO', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            this.basicdatagridListePOA.datagrid.dataset = response.items;
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
