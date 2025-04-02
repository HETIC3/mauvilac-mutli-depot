import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ArrayUtil, CoreBase, MIRecord } from '@infor-up/m3-odin';
import { UserService } from '@infor-up/m3-odin-angular';
import { SohoDataGridComponent, SohoMessageService } from 'ids-enterprise-ng';
import { Subscription } from 'rxjs';
import { BasicAPIService } from './../../services/basicAPI.service';


@Component({
   selector: 'app-basicgrid',
   templateUrl: './basicgrid.component.html',
   styleUrls: ['./basicgrid.component.css']
})

export class BasicGridComponent extends CoreBase implements OnInit {
   @ViewChild('BasicDatagrid') datagrid: SohoDataGridComponent;

   datagridOptions: SohoDataGridOptions;
   items: any[] = [];
   detailItem: any;
   hasSelected: boolean;
   isBusy = false;
   isDetailBusy = false;
   initOK = false;
   resultat: MIRecord[] = [];
   record: any = {};

   @Input() program: string;
   @Input() transaction: string;
   @Input() outputFields: any[];
   @Input() inputFields: MIRecord;
   @Input() optionsDataGrid: SohoDataGridOptions;
   @Input() maxRecords: number;
   @Input() initialise = true;
   @Input() treeGrid = false;

   @Output() sendDataSelect = new EventEmitter();
   @Output() sendDataClick = new EventEmitter();
   @Output() sendDataDoubleClick = new EventEmitter();
   @Output() refreshOK = new EventEmitter();
   @Output() filteredOK = new EventEmitter();
   @Output() sendRowClick = new EventEmitter();
   @Output() beforeentereditmode = new EventEmitter();
   @Output() entereditmode = new EventEmitter();
   @Output() exiteditmode = new EventEmitter();
   @Output() keydown = new EventEmitter();




   subscription: Subscription;

   constructor(private userService: UserService, private APIService: BasicAPIService, private messageService: SohoMessageService) {
      super('BasicGridComponent');
   }

   ngOnInit() {
      this.detailItem = this.inputFields;
      if (this.initialise !== false) {
         this.initGrid();
         this.listItems();
         this.initOK = true;
      }
   }

   mergeDataset(program: string, transaction: string, outputfields: any, inputfields: any, maxrecords: number, merges: any[]) {
      if (this.isBusy) { return; }
      this.setBusy(true);
      this.userService.getUserContext().subscribe((context) => {
         this.subscription = this.APIService.GetFieldValue(program, transaction, outputfields, inputfields, maxrecords).subscribe((response) => {
            if (!response.hasError()) {
               this.items = response.items;
               this.items.forEach(item => {
                  const res = new MIRecord();

                  merges.forEach(merge => {
                     const fieldA = item[merge['fieldA']] ? item[merge['fieldA']] : ' ';
                     const fieldV = merge['fieldV'];
                     res.setString(fieldV, fieldA);
                  });

                  this.resultat.push(res);

               });
               this.datagrid.dataset = this.resultat;
               this.subscription.unsubscribe();
               this.setBusy(false);
               this.initOK = true;
               this.refreshOK.emit(transaction);
            } else {
               this.handleError('Failed to list items');
            }
            // this.setBusy(false);
         }, (error) => {
            this.setBusy(false);
            this.handleError('Failed to list items', error);
         });
      }, (error) => {
         this.setBusy(false);
         this.handleError('Failed to get user context', error);
      });

   }

   onVisible() {
      //console.log('This action on visible :' + this.initialise);
      if (this.initialise === true) {
         this.detailItem = this.inputFields;
         this.initGrid();
         this.listItems();
      }

   }

   onRefresh() {
      //console.log('This action on refresh');
      this.detailItem = this.inputFields;
      //this.datagrid.gridOptions = this.optionsDataGrid;
      this.initGrid();
      this.listItems();
      this.initOK = true;
   }

   onFilter(field: string, filter: string, opetrator: string) {
      //console.log('This action on filter');
      this.updateGridData();
   }

   onFiltered(e: SohoDataGridFilteredEvent) {
      //console.log(e);
      this.filteredOK.emit('Filtered');
   }

   onsettingsChanged(e: SohoDataGridSettingsChangedEvent) {
      //console.log(e);
      if (e.filter.length > 0) {
         if (e.filter[0].value === '') {
            this.refreshOK.emit('ok');
         }
      }

   }

   onafterrender(e: SohoDataGridSettingsChangedEvent) {
      //console.log(e);
      this.filteredOK.emit('ok');
   }


   private initGrid() {
      this.datagridOptions = this.optionsDataGrid;
   }

   private listItems() {
      if (this.isBusy) { return; }
      this.setBusy(true);
      this.userService.getUserContext().subscribe((context) => {
         this.subscription = this.APIService.GetFieldValue(this.program, this.transaction, this.outputFields, this.inputFields,
            this.maxRecords).subscribe((response) => {
               if (!response.hasError()) {
                  this.items = response.items;

                  this.updateGridData();

                  this.refreshOK.emit('ok');
                  this.setBusy(false);
                  this.subscription.unsubscribe();
               } else {
                  this.handleError('Failed to list items');
               }
               this.setBusy(false);
            }, (error) => {
               this.setBusy(false);
               this.handleError('Failed to list items', error);
            });
      }, (error) => {
         this.setBusy(false);
         this.handleError('Failed to get user context', error);
      });
   }

   onSelected(args: any[], isSingleSelect?: boolean) {
      //console.log('Selection');
      //this.sendDataSelect.emit(args[0].data);
      if (this.isBusy) { return; }

      const newCount = args.length;
      let selected = args && newCount === 1 ? args[0].data : null;
      this.hasSelected = !!selected;
      //selected['pos']=this.record;
      if (this.hasSelected) {
         this.sendDataSelect.emit(selected);
      }
   }

   onclick(args: any[]) {
      //console.log('click');
      this.record = {
         target: args['type'],
         text: args['target'].innerText,
         column: args['target'].offsetParent['cellIndex'] === undefined ? args['target'].parentElement.offsetParent['cellIndex'] : args['target'].offsetParent['cellIndex'],
         row: args['target'].offsetParent.parentElement['rowIndex'] === undefined ? args['target'].parentElement.offsetParent.parentElement['rowIndex'] : args['target'].offsetParent.parentElement['rowIndex']
      };

      // for (let i = 0; i < this.datagrid.dataset.length; i++) {
      //   if ((i+1)=== this.record.row) {
      if (this.record.row !== undefined) {
         const index = this.record.row - 1;
         this.record['item'] = this.datagrid.dataset[this.datagrid['datagrid']['currentPageRows'][index]['dataIndex']];
      }

      // }
      // }

      this.datagrid.dataset.forEach(data => {
         if (data.id === this.record.row) {
            this.record['item'] = data;
         } else {
            if (data.children !== undefined) {
               data.children.forEach(item => {
                  if (item.id === this.record.row) {
                     this.record['item'] = item;
                  }
               })
            }
         }
      })

      if (this.record.column !== undefined) {
         this.sendDataClick.emit(this.record);
      }

   }

   onRowclick(args: any[]) {
      //console.log('doubleclick');
      this.sendRowClick.emit(args);
   }

   ondoubleclick(args: any[]) {
      //console.log('doubleclick');
      this.sendDataDoubleClick.emit(args);
   }

   updateGridData() {
      this.datagrid ? this.datagrid.dataset = this.items : this.datagridOptions.dataset = this.items;

   }

   private setBusy(isBusy: boolean, isDetail?: boolean) {
      isDetail ? this.isDetailBusy = isBusy : this.isBusy = isBusy;
   }

   private handleError(message: string, error?: any) {
      this.logError(message, error ? '- Error: ' + JSON.stringify(error) : '');
      const buttons = [{ text: 'Ok', click: (e, modal) => { modal.close(); } }];
      this.messageService.error()
         .title('An error occured')
         .message(message + '. More details might be available in the browser console.')
         .buttons(buttons)
         .open();
   }

   public onBeforeEnterEditMode(event: SohoDataGridEditModeEvent) {
      this.beforeentereditmode.emit(event);
   }

   public onEnterEditMode(event: SohoDataGridEditModeEvent) {
      this.entereditmode.emit(event);
   }

   public onExitEditMode(event: SohoDataGridEditModeEvent) {
      this.exiteditmode.emit(event);
   }

   private cnt = 1;

   // Note: If we called this onKeyDown we would get the NG keydown firing as well.
   public onKeyDown(event: SohoDataGridKeyDownEvent) {
      this.keydown.emit(event);
   }


}
