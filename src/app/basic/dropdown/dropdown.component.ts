import { Component, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { UserService } from '@infor-up/m3-odin-angular';
import { SohoDropDownComponent, SohoMessageService, SohoBusyIndicatorDirective, SohoBusyIndicatorEvent} from 'ids-enterprise-ng';
import { BasicAPIService } from './../../services/basicAPI.service';


@Component({
   selector: 'app-dropdown',
   templateUrl: './dropdown.component.html'
})


export class DropdownComponent extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @ViewChild(SohoDropDownComponent) dropdown: SohoDropDownComponent;

   @Input() namebox: string;
   @Input() program: string;
   @Input() transaction: string;
   @Input() outputFields: any[];
   @Input() inputFields: any;
   @Input() maxRecords: number;
   @Input() value: string;
   @Input() text: string;
   @Input() AddValueToText = true;
   @Input() data: any[] = [];
   @Input() initialvalue: string;
   @Input() initialise= true;
   @Input() required= false;
   @Input() purge= true;
   @Input() background= 'white';

   @Output() selectedid = new EventEmitter<string>();
   @Output() initialised = new EventEmitter<string>();

   detailItem: any;

   options: any = [];
   blank = '';
   isBusy = false;

   public model = { selectedOption: 'ND' };

   constructor(private userService: UserService,
               private APIService: BasicAPIService, private messageService: SohoMessageService) {
      super('DropdownSampleComponent');
   }

   ngOnInit() {
      if (this.data !== undefined) {

       if (this.data.length > 0 && this.initialise===true) {

         if (this.value!==undefined && this.value!==''){
         
            for (const item of this.data ) {
               if (this.purge===true &&  item[this.value]==='') {  
               } else {
               if (this.AddValueToText) {
                  this.options.push({value : item[this.value], text : item[this.value] + '-' + item[this.text]} );
                }
               else {
                  this.options.push({value : item[this.value], text : item[this.text]});
               }
               
               }
           }
         } else {
            this.options = this.data;
         }
         this.updatedropdownData([]);
      } else {
         if (this.initialise===true) {this.listItems();}
      }
      } else {
         if (this.initialise===true) {this.listItems();}
      }
   }
   listItems() {
      (this.busyIndicator as any).activated = true;
      //this.isBusy=true;
      this.userService.getUserContext().subscribe((context) => {
         this.APIService.GetFieldValue(this.program, this.transaction, this.outputFields, this.inputFields,
                                      this.maxRecords).subscribe(response => {
           if (!response.hasError()) {
              for (const item of response.items ) {
                 if (this.AddValueToText) {
                    this.options.push({value : item[this.value], text : item[this.value] + '-' + item[this.text]} );
                  }
                 else {
                    this.options.push({value : item[this.value], text : item[this.text]});
                 }}
              this.updatedropdownData(response.items);
           } else {
              this.handleError('Failed to list items');
           }
        }, (error) => {
                this.handleError('Failed to list items', error);
        });
      }, (error) => {
          this.handleError('Failed to get user context', error);
     });
     (this.busyIndicator as any).activated = false;
     //this.isBusy=false;
    }

   private updatedropdownData(items:any) {
      setTimeout(() => { this.dropdown.updated();
         this.initialised.emit(items);
      });
   }

   onChange(e: SohoDropDownEvent) {
    // console.log(`change ${e.data}`);
    this.selectedid.emit(e.data);
   }


   private handleError(message: string, error?: any) {
      if (error.errorCode!=="XRE0103"){
      this.logError(message, error ? '- Error: ' + JSON.stringify(error) : '');
      const buttons = [{ text: 'Ok', click: (e, modal) => { modal.close(); } }];
      this.messageService.error()
         .title('An error occured')
         .message(message + '. More details might be available in the browser console.')
         .buttons(buttons)
         .open();
      }   
   }

   onstylebackground(){
   return this.background;
   }
}

// tslint:disable-next-line: component-class-suffix
export class DropdownData {
   public value: string = null;
   public text: string = null;
 }
