import { Component, Input, OnInit } from '@angular/core';


/**
 * This is an example of a simple dialog component, that can be instantiated
 * numerous times using the SohoModalDialogService.
 */
@Component({
   templateUrl: 'ModalDialogOneColumn.component.html'
})



export class ModalDialogAllColumnComponent implements OnInit {
   dataset: any[] = [];
   field: string = "";
   columnsListeZoom = [
      { id: 'Periode', field: 'Periode', name: 'Période', width: 40, sortable: false },
      { id: 'STO1', field: 'STO1', name: 'Stock début', width: 30, sortable: false, filterType: 'text' },
      { id: 'ENTR', field: 'ENTR', name: 'Entrée', width: 30, sortable: false, filterType: 'text' },
      { id: 'RECE', field: 'RECE', name: 'Receptionée', width: 30, sortable: false, filterType: 'text' },
      { id: 'QOUT', field: 'QOUT', name: 'Sortie', width: 30, sortable: false, filterType: 'text' },
      { id: 'CONS', field: 'CONS', name: 'Consommation', width: 30, sortable: false, filterType: 'text' },
      { id: 'REGU', field: 'REGU', name: 'Régul', width: 30, sortable: false, filterType: 'text' },
      { id: 'CMDE', field: 'CMDE', name: 'Commande', width: 30, sortable: false, filterType: 'text' },
      { id: 'DADF', field: 'DADF', name: 'DA/DF', width: 30, sortable: false, filterType: 'text' },

      { id: 'PERI', field: 'PERI', name: 'PERI', hidden: true, width: 30, sortable: false, filterType: 'text' },
      { id: 'ID', field: 'ID', name: '', hidden: true, sortable: false, formatter: Soho.Formatters.SelectionCheckbox },
      { id: 'AnneeMois', field: 'AnneeMois', hidden: true, name: 'AnneeMois', width: 40, sortable: false },
      { id: 'ITNO', field: 'ITNO', name: 'TOTAL', hidden: true, width: 30, sortable: false, filterType: 'text' },
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
