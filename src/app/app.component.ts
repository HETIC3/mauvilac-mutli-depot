import { Component, OnInit, ViewChild } from '@angular/core';
import { CoreBase, IMIRequest, IUserContext } from '@infor-up/m3-odin';
import { MIService, UserService } from '@infor-up/m3-odin-angular';
import { Observable, Subscription } from 'rxjs';
import { BasicAPIService } from './services/basicAPI.service';
import { SohoBusyIndicatorDirective, SohoDataGridComponent } from 'ids-enterprise-ng';
import { BasicGridComponent } from './basic/grid/basicgrid.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ArticleService } from './services/article.service';
import { ValidatorService } from './services/validator.service';
import { ArticleRow } from './interface/fournisseur-row';
import { multidepotComponent } from './component/multidepot/multidepot.component';
import { poaComponent } from './component/POA/poa.component';
import { pofComponent } from './component/POF/pof.component';



@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})


export class AppComponent extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @ViewChild('basicdatagridListearticle') basicdatagridListearticle: SohoDataGridComponent;
   @ViewChild('cmpmultidepot') cmpmultidepot: multidepotComponent;
   @ViewChild('cmppoa') cmppoa: poaComponent;
   @ViewChild('cmppof') cmppof: pofComponent;

   userContext = {} as IUserContext;
   isBusy = false;
   company: string;
   CUCD: string;
   currentCompany: string;
   division: string;
   currentDivision: string;
   language: string;
   currentLanguage: string;
   expanded = false;

   //Filtre article (deux onglets)
   ITNO: string;
   ITNO_2: string;
   ITNO_new: string;

   //Filtre statut article
   STAT: string = '20';
   STAT_2: string = '20';

   //Filtre Etablissement
   WHSL: string;
   WHSL_2: string;

   //Ligne selectionné de la première datagrid
   dataselect: Object[] = [];
   lineSelected: any = '';
   ITNOSelected: string = '';
   WHLOSelected: string = '';
   FACISelected: string = '';

   //Filtre Dépôt
   ListWHLO: any[] = [];
   selectWHLO: string;


   ListWHLO_2: any[] = [];
   selectWHLO_2: string;

   //Filtre emplacemnet
   ListWHSL: any[] = [];
   selectWHSL: string;

   //Filtre groupe Dépôt
   ListWHGR: any[] = [];
   selectWHGR: string = '';

   USID: string = '';
   USERWHLO: string = '';

   //Filtre Vente
   SALE: string = '1';

   //Filtre Article
   busyItem = true;
   SearchItem: any[];
   articleDatasetLookup: any[] = [];
   articleListValidator: Set<string> = new Set<string>();
   articleLookupColumns: SohoDataGridColumn[] = [
      { id: 'MMITNO', field: 'MMITNO', name: 'Article', sortable: true, filterType: 'text' },
      { id: 'MMITDS', field: 'MMITDS', name: 'Désignation', sortable: true, filterType: 'text' },
   ]

   public searchfieldOptionsItem = {
      filterMode: 'contains',
      delay: 500,
      clearable: true,
      showAllResults: false,
      source: (query: any, done: any) => {
         this.source(query, done);
      }
   };


   filter: FormGroup = this.fb.group({
      fournisseur: ['', this._validatorService.formValidator(this.articleListValidator, "article")],
   });



   columnsListearticle = [
      { id: 'ID', field: 'ID', name: '', hidden: true, sortable: false, formatter: Soho.Formatters.SelectionCheckbox },
      { id: 'MLITNO', field: 'MLITNO', name: 'Code article', width: 30, sortable: false, filterType: 'text' },
      { id: 'MMITDS', field: 'MMITDS', name: 'Nom ', width: 70, sortable: false, filterType: 'text' },
      { id: 'MMSTAT', field: 'MMSTAT', name: 'Stt', width: 10 },
      { id: 'MMSALE', field: 'MMSALE', name: 'Vente', width: 20 },
      { id: 'MLWHLO', field: 'MLWHLO', name: 'Dépôt', width: 40, sortable: false },
      { id: 'MLWHSL', field: 'MLWHSL', name: 'Emplacement', width: 40, sortable: false },
      { id: 'V_STDP', field: 'V_STDP', name: 'Stock Dispo', width: 40, sortable: false },
      { id: 'MLSTQT', field: 'MLSTQT', name: 'Stock physique', width: 40, sortable: false },
      { id: 'MLALQT', field: 'MLALQT', name: 'Stock Reservé', width: 40, sortable: false },
      { id: 'ODSAPR', field: 'ODSAPR', name: 'Tarif vente', width: 40, sortable: false },
      { id: 'MNWHGR', field: 'MNWHGR', hidden: true, name: 'Groupe Dépôt', width: 50, sortable: false },
      { id: 'MWFACI', field: 'MWFACI', hidden: true, name: 'Etablissement', width: 50, sortable: false },


   ];
   optionsDataGridListearticle: SohoDataGridOptions = {
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
      pagesize: 10,
      indeterminate: false,
      columns: this.columnsListearticle,
      dataset: [],
      emptyMessage: {
         title: 'Aucune donnée',
         icon: 'icon-empty-no-data'
      },
   };


   constructor(private miService: MIService, private userService: UserService, private APIService: BasicAPIService, private fb: FormBuilder, private _articleService: ArticleService, private _validatorService: ValidatorService) {
      super('AppComponent');
   }

   async ngOnInit() {
      this.logWarning('chargement Mashup article 360');
      this.logInfo('onClickLoad');
      this.setBusy(true);
      this.userService.getUserContext().subscribe((userContext: IUserContext) => {
         this.setBusy(false);
         this.logInfo('onClickLoad: Received user context');
         this.userContext = userContext;
         this.USID = this.userContext.USID;
         console.log(this.userContext);
         this.USERWHLO = this.userContext.WHLO
         this.getListWHLO();

      }, (error) => {
         this.setBusy(false);
         this.logError('Unable to get userContext ' + error);
      });

      this.getListgroupWHLO();
      this.getListWHSL();
      //this.getLookupData();
   }

   private setBusy(isBusy: boolean) {
      this.isBusy = isBusy;
   }

   getLookupData() {
      this._articleService.list().subscribe({
         next: (values: ArticleRow[]) => {
            this.articleDatasetLookup = values;
            values.forEach((value) => {
               this.articleListValidator.add(value.MMITNO);
            });
            this.busyItem = false;
         },
         error: error => {
            console.error(error);
            this.busyItem = false;
         }
      });
   }


   rechercher() {
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         F_ITNO: this.ITNO,
         T_ITNO: this.ITNO,
         F_WHLO: this.selectWHLO,
         T_WHLO: this.selectWHLO,
         F_WHSL: this.selectWHSL,
         T_WHSL: this.selectWHSL,
         MMSTAT: this.STAT,

      };
      inputFields = newrecord;
      let subscription: Subscription;


      subscription = this.APIService.GetFieldValue('CMS100MI', 'LstMSH_MT_1', outputFields, inputFields, 0).subscribe({
         next: (response) => {

            if (this.STAT != '') {
               for (let i = 0; i < response.items.length; i++) {
                  if (response.items[i].MMSTAT != this.STAT) {
                     response.items.splice(i, 1);  // Supprime l'élément à l'index 'i'
                     i--;  // Réduit l'indice pour ne pas sauter un élément après le retrait
                  }
               }
            }
            if (this.selectWHGR != '') {
               for (let i = 0; i < response.items.length; i++) {
                  if (response.items[i].MNWHGR != this.selectWHGR) {
                     response.items.splice(i, 1);  // Supprime l'élément à l'index 'i'
                     i--;  // Réduit l'indice pour ne pas sauter un élément après le retrait
                  }
               }
            }

            if (this.SALE != '') {
               for (let i = 0; i < response.items.length; i++) {
                  if (response.items[i].MMSALE != this.SALE) {
                     response.items.splice(i, 1);  // Supprime l'élément à l'index 'i'
                     i--;  // Réduit l'indice pour ne pas sauter un élément après le retrait
                  }
               }
            }

            for (let i = 0; i < response.items.length; i++) {
               response.items[i].ODSAPR = parseFloat(response.items[i].ODSAPR).toFixed(3);
            }
            this.basicdatagridListearticle.dataset = response.items;
            console.log(this.basicdatagridListearticle.dataset);
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


   async onevent(e: any, TypeEvent: string) {
      if (TypeEvent === 'sendDataClick') {
         this.dataselect = [];
         this.dataselect.push(e[0].data);
         console.log(this.dataselect);
         this.lineSelected = this.dataselect[0];
         console.log(this.lineSelected)
         //var itemlineSelected = this.lineSelected.item;
         //this.lineSelected = itemlineSelected;
         this.ITNOSelected = this.lineSelected.MLITNO;
         this.WHLOSelected = this.lineSelected.MLWHLO;
         this.FACISelected = this.lineSelected.MWFACI;
         setTimeout(() => {
            this.cmpmultidepot.afficheItem();

            //this.cmppoa.getListPOA();
         }, 10);

      }
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
            this.ListWHLO_2 = response.items;
            this.selectWHLO = this.userContext.WHLO;
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

   getListWHSL() {
      this.ListWHSL = [];
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];

      let newrecord = {

      };

      inputFields = newrecord;
      let subscription: Subscription;
      subscription = this.APIService.GetFieldValue('MMS010MI', 'ListLocations', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            let seenValues = new Set();
            response.items = response.items.filter(item => {
               const value = item.WHSL.trim(); // Suppression des espaces superflus

               if (!seenValues.has(value)) {
                  seenValues.add(value);
                  return true; // Garder l'élément
               }

               return false; // Ignorer les doublons
            });
            this.ListWHSL = response.items;
            this.selectWHSL = 'N'
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

   getListgroupWHLO() {
      this.ListWHGR = [];
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];

      let newrecord = {

      };

      inputFields = newrecord;
      let subscription: Subscription;
      subscription = this.APIService.GetFieldValue('CMS100MI', 'LstMSH_MT_3', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            console.log("Adrien");
            let seenValues = new Set();
            response.items = response.items.filter(item => {
               const value = item.MNWHGR.trim(); // Suppression des espaces superflus

               if (!seenValues.has(value)) {
                  seenValues.add(value);
                  return true; // Garder l'élément
               }

               return false; // Ignorer les doublons
            });
            this.ListWHGR = response.items;
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


   public source = (term: string, response: any) => {
      this.SearchItem = [];

      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];

      let newrecord = {
         SQRY: "SearchFields:ITNO;ITDS;FUDS " + term + "*",
         //SQRY: "SearchFields:ITNO;FUDS;ITDS: BLANC*"
      };
      inputFields = newrecord;
      let subscription: Subscription;
      subscription = this.APIService.GetFieldValue('MMS200MI', 'SearchItem', outputFields, inputFields, 100).subscribe({
         next: (ITNO) => {
            ITNO.items.forEach(item => {
               this.SearchItem.push({ label: item.ITDS + ' : ' + item.ITNO, value: item.ITNO });
            });
            response(term, this.SearchItem);
            (this.busyIndicator as any).activated = false;
         }, error: (error) => {

         }
      });
   }

   onKeydown(event: any): void {
      if (event.key === 'Enter') {
         this.ITNO = event.target.value;
      }
   }

   onSelectedITNO(event): void {
      if (event[2].value === '') return
      this.ITNO = event[2].value;
   }

   onClear(event: any): void {
      this.ITNO = '';

   }

   expand() {
      this.expanded = !this.expanded;
      if (this.expanded) {
         document.getElementById("firstPart").classList.add("expanded");
         document.getElementById("secondPart").classList.add("expanded");
         document.getElementById("expander").textContent = "▲";
      } else {
         document.getElementById("firstPart").classList.remove("expanded");
         document.getElementById("secondPart").classList.remove("expanded");
         document.getElementById("expander").textContent = "▼";
      }
   }

}
