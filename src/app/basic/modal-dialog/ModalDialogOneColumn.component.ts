import { Component, Input, OnInit } from '@angular/core';


/**
 * This is an example of a simple dialog component, that can be instantiated
 * numerous times using the SohoModalDialogService.
 */
@Component({
   templateUrl: 'ModalDialogOneColumn.component.html'
})



export class ModalDialogOneColumnComponent implements OnInit {
   dataset: any[] = [];
   field: string = "";
   columnsListeZoom = [
      { id: 'ITNO', field: 'ITNO', name: 'Code article', width: 30, sortable: false, filterType: 'text' },
      { id: 'TRDT', field: 'TRDT', name: 'Date Transaction', width: 30, sortable: false, filterType: 'text' },
      { id: 'TTID', field: 'TTID', name: 'Type Transaction', width: 30, sortable: false, filterType: 'text' },
      { id: 'YP40', field: 'YP40', name: 'Libelle Transaction', width: 30, sortable: false, filterType: 'text' },
      { id: 'FIELD', field: 'FIELD', name: 'Qte', width: 30, sortable: false, filterType: 'text' },
   ];

   optionsDataGridListeZoom: SohoDataGridOptions = {
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
      paging: false,
      //pagesize: 5,
      indeterminate: false,
      columns: this.columnsListeZoom,
      dataset: [],
      emptyMessage: {
         title: 'Aucune donnée',
         icon: 'icon-empty-no-data'
      },
   };

   ngOnInit(): void {
      // On met à jour le dataset passé en Input
      this.optionsDataGridListeZoom.dataset = this.dataset;
   }

}
