import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { SohoBusyIndicatorDirective } from 'ids-enterprise-ng';
import { Subscription } from 'rxjs';
import { BasicGridComponent } from 'src/app/basic/grid/basicgrid.component';
import { BasicAPIService } from 'src/app/services/basicAPI.service';


@Component({
   selector: 'cmp-multidepot',
   templateUrl: './multidepot.component.html',
   styleUrls: ['./multidepot.component.css']
})
export class multidepotComponent extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @ViewChild('basicdatagridListearticleMultiDepot') basicdatagridListearticleMultiDepot: BasicGridComponent;

   @Input() ITNOSelected: string;

   dataselect: Object[] = [];
   lineSelected: any = '';
   isBusy = false;

   columnsListearticleMultiDepot = [
      { id: 'ID', field: 'ID', name: '', hidden: true, sortable: false, formatter: Soho.Formatters.SelectionCheckbox },
      { id: 'MLITNO', field: 'MLITNO', name: 'Code article', width: 30, sortable: false, filterType: 'text' },
      { id: 'MMITDS', field: 'MMITDS', name: 'Nom ', width: 70, sortable: false, filterType: 'text' },
      { id: 'MMSTAT', field: 'MMSTAT', name: 'Stt', width: 10 },
      { id: 'MMSALE', field: 'MMSALE', name: 'Vente', width: 20 },
      { id: 'MLWHLO', field: 'MLWHLO', name: 'Dépôt', width: 40, sortable: false },
      { id: 'MLWHSL', field: 'MLWHSL', name: 'Emplacement', width: 40, sortable: false },
      { id: 'V_STDP', field: 'V_STDP', name: 'Stock Dispo', width: 40, sortable: false },
      { id: 'MLSTQT', field: 'MLSTQT', name: 'Stock physique', width: 40, sortable: false },
      { id: 'MLALQT', field: 'MLALQT', name: 'Stock Reservé', width: 80, sortable: false },


   ];

   optionsDataGridListearticleMultiDepot: SohoDataGridOptions = {
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
      pagesize: 10,
      indeterminate: false,
      columns: this.columnsListearticleMultiDepot,
      dataset: [],
      emptyMessage: {
         title: 'Aucune donnée',
         icon: 'icon-empty-no-data'
      },
   };


   constructor(private APIService: BasicAPIService) {
      super('multidepotComponent');
   }

   ngOnInit(): void {
      this.logWarning('chargement Panel multiDépôt');
   }

   afficheItem() {
      this.basicdatagridListearticleMultiDepot.datagrid.dataset = [];
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         MLITNO: this.ITNOSelected,
         F_ITNO: this.ITNOSelected,
         T_ITNO: this.ITNOSelected,

      };
      inputFields = newrecord;
      let subscription: Subscription;


      subscription = this.APIService.GetFieldValue('CMS100MI', 'LstMSH_MT_2', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            console.log(response);
            var lRes = response.items.length - 1;
            /*if (response.items[lRes].MLSTQT !== null) {
               response.items[lRes].V_STDP = response.items[lRes].MLSTQT - response.items[lRes].MLALQT;
            }*/
            this.basicdatagridListearticleMultiDepot.datagrid.dataset = response.items;
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
