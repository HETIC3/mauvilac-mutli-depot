import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { SohoBusyIndicatorDirective } from 'ids-enterprise-ng';
import { ApplicationService } from '@infor-up/m3-odin-angular';
import { Subscription } from 'rxjs';
import { BasicGridComponent } from 'src/app/basic/grid/basicgrid.component';
import { BasicAPIService } from 'src/app/services/basicAPI.service';


@Component({
   selector: 'cmp-pod',
   templateUrl: './pod.component.html',
   styleUrls: ['./pod.component.css']
})
export class podComponent extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @ViewChild('basicdatagridListePOD') basicdatagridListePOD: BasicGridComponent;

   @Input() ITNOSelected: string;
   @Input() WHLOSelected: string;
   @Input() USID: string;

   //Filtre Dépôt
   ListWHLO: any[] = [];
   FWHL: string;
   TWHL: string;

   //Filtre type d'Ordre
   ListORTY: any[] = [];
   ORTY: string;


   DLDT: string;
   PPQT: string;

   dataselect: Object[] = [];
   lineSelected: any = '';
   isBusy = false;
   disabledBTenrgistrer = false;


   columnsListePOD = [
      { id: 'ID', field: 'ID', name: '', hidden: true, sortable: false, formatter: Soho.Formatters.SelectionCheckbox },
      { id: 'DOPLPN', field: 'DOPLPN', name: 'Ordre planifié', width: 20, sortable: false, filterType: 'text' },
      { id: 'DOITNO', field: 'DOITNO', name: 'Code article', width: 20, sortable: false, filterType: 'text' },
      { id: 'DOTWHL', field: 'DOTWHL', name: 'Dépôt destination', width: 20, sortable: false, filterType: 'text' },
      { id: 'DOFWHL', field: 'DOFWHL', name: 'Dépôt départ', width: 20 },
      { id: 'DLDT', field: 'DLDT', name: 'Date planif', width: 20 },
      { id: 'PPQT', field: 'PPQT', name: 'Qte planif', width: 10 },

   ];

   optionsDataGridListePod: SohoDataGridOptions = {
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
      columns: this.columnsListePOD,
      dataset: [],
      emptyMessage: {
         title: 'Aucune donnée',
         icon: 'icon-empty-no-data'
      }
   };




   constructor(private APIService: BasicAPIService, private applicationService: ApplicationService) {
      super('pod');
   }

   ngOnInit(): void {
      this.logWarning('chargement Panel POD');
      this.getListWHLO();
      this.getListORTY();
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

   getListORTY() {
      this.ListORTY = [];
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];

      let newrecord = {
         TTYP: '51'
      };

      inputFields = newrecord;
      let subscription: Subscription;
      subscription = this.APIService.GetFieldValue('CRS200MI', 'LstOrderType', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            this.ListORTY = response.items;

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

   createPOD() {
      if (this.TWHL == '') {
         alert("Dépôt de destination obligatiore");
         return;
      }

      if (this.FWHL == '') {
         alert("Dépôt de départ obligatiore");
         return;
      }

      if (this.ITNOSelected == '') {
         alert("Code article obligatiore");
         return;
      }

      if (this.ORTY == '') {
         alert("Type d'odre obligatiore");
         return;
      }

      if (!this.isValidJJMMAADate(this.DLDT) || this.DLDT == '') {
         alert("La date est obligatoire et doit être renseigné au format JJMMAA");
         return;
      }

      if (isNaN(Number(this.PPQT)) || this.PPQT == '') {
         alert("La quantité est obligatoire");
         return
      }

      let query: string = 'mforms://_automation?data=%3c%3fxml+version%3d%221.0%22+encoding%3d%22utf-8%22%3f%3e%3csequence%3e%3cstep+command%3d%22RUN%22+value%3d%22DPS170%22+%2f%3e%3cstep+command%3d%22KEY%22+value%3d%22F17%22+%2f%3e%3cstep+command%3d%22AUTOSET%22%3e%3cfield+name%3d%22W1TWHL%22%3e'
         + this.TWHL + '%3c%2ffield%3e%3cfield+name%3d%22W1FWHL%22%3e'
         + this.FWHL + '%3c%2ffield%3e%3cfield+name%3d%22W1ITNO%22%3e'
         + this.ITNOSelected + '%3c%2ffield%3e%3cfield+name%3d%22W1ORTY%22%3e'
         + this.ORTY + '%3c%2ffield%3e%3c%2fstep%3e%3cstep+command%3d%22KEY%22+value%3d%22ENTER%22+%2f%3e%3cstep+command%3d%22AUTOSET%22%3e%3cfield+name%3d%22WEDLDT%22%3e'
         + this.DLDT + '%3c%2ffield%3e%3cfield+name%3d%22WEPPQT%22%3e'
         + this.PPQT + '%3c%2ffield%3e%3c%2fstep%3e%3cstep+command%3d%22KEY%22+value%3d%22ENTER%22+%2f%3e%3cstep+command%3d%22KEY%22+value%3d%22F3%22+%2f%3e%3c%2fsequence%3e';
      this.applicationService.launch(query);

      setTimeout(() => {
         this.getListPOD();
      }, 1000);

   }

   UpdatePOD() {
      if (this.ITNOSelected !== '') {
         let query: string = 'mforms://_automation?data=%3c%3fxml+version%3d%221.0%22+encoding%3d%22utf-8%22%3f%3e%3csequence%3e%3cstep+command%3d%22RUN%22+value%3d%22DPS170%22+%2f%3e%3cstep+command%3d%22AUTOSET%22%3e%3cfield+name%3d%22WWQTTP%22%3e70%3c%2ffield%3e%3c%2fstep%3e%3cstep+command%3d%22AUTOSET%22%3e%3cfield+name%3d%22W1OBKV%22%3e'
            + this.ITNOSelected + '%3c%2ffield%3e%3c%2fstep%3e%3cstep+command%3d%22KEY%22+value%3d%22ENTER%22+%2f%3e%3c%2fsequence%3e';
         this.applicationService.launch(query);
      }
   }


   isValidJJMMAADate(dateStr: string): boolean {
      // Vérifie que la chaîne est exactement composée de 6 chiffres
      if (!/^\d{6}$/.test(dateStr)) {
         return false;
      }

      const jour = parseInt(dateStr.substring(0, 2), 10);
      const mois = parseInt(dateStr.substring(2, 4), 10);
      const annee = parseInt(dateStr.substring(4, 6), 10);

      const fullYear = annee + 2000;


      const date = new Date(fullYear, mois - 1, jour);

      // Vérifie que la date générée correspond bien aux éléments
      return (
         date.getFullYear() === fullYear &&
         date.getMonth() === mois - 1 &&
         date.getDate() === jour
      );
   }

   getListPOD() {
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         F_ITNO: this.ITNOSelected,
         T_ITNO: this.ITNOSelected
      };
      inputFields = newrecord;
      let subscription: Subscription;


      subscription = this.APIService.GetFieldValue('CMS100MI', 'LstMSH_MT_6', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            this.basicdatagridListePOD.datagrid.dataset = response.items;
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
