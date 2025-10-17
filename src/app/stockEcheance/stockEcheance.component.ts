import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CoreBase, IUserContext } from '@infor-up/m3-odin';
import { MIRecord, MIResponse } from '@infor-up/m3-odin/dist/mi/runtime';
import { SohoBusyIndicatorDirective, SohoModalDialogService } from 'ids-enterprise-ng';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { BasicGridComponent } from 'src/app/basic/grid/basicgrid.component';
import { BasicAPIService } from 'src/app/services/basicAPI.service';
import { MMS80component } from '../component/MMS080/MMS080.component';
import { ModalDialogOneColumnComponent } from 'src/app/basic/modal-dialog/ModalDialogOneColumn.component';
import { ModalDialogAllColumnComponent } from 'src/app/basic/modal-dialog/ModalDialogAllColumn.component';
import { UserService } from '@infor-up/m3-odin-angular';
import { poaComponent } from '../component/POA/poa.component';
import { pofComponent } from '../component/POF/pof.component';



@Component({
   selector: 'cmp-stockEcheance',
   templateUrl: './stockEcheance.component.html',
   styleUrls: ['./stockEcheance.component.css']
})



export class stockEcheanceComponent extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @ViewChild('basicdatagridListeStockEcheance') basicdatagridListeStockEcheance: BasicGridComponent;
   @ViewChild('basicdatagridZoom') basicdatagridZoom: BasicGridComponent;
   @ViewChild('cmpMMS080') cmpMMS080: MMS80component;
   @ViewChild('cmppoa') cmppoa: poaComponent;
   @ViewChild('cmppof') cmppof: pofComponent;
   @ViewChild('dialogOneColumn', { read: ViewContainerRef, static: true })
   placeholderOneColumn?: ViewContainerRef;
   @ViewChild('dialogAllColumn', { read: ViewContainerRef, static: true })
   placeholderAllColumn?: ViewContainerRef;

   public closeResult = '(N/A)';
   public title = 'Zoom sur la donnée';

   @Input() ITNOSelected: string = '';
   @Input() USERWHLO: string;


   userContext = {} as IUserContext;
   dataselect: Object[] = [];
   lineSelected: any = '';
   isBusy = false;
   USID: string = '';

   //Filtre article (deux onglets)
   @Input() ITNO_2: string = '';
   @Input() ITDS: string;
   busyItem = true;
   SearchItem: any[];

   public searchfieldOptionsItem = {
      filterMode: 'contains',
      delay: 500,
      clearable: true,
      showAllResults: false,
      source: (query: any, done: any) => {
         this.source(query, done);
      }
   };

   //Filtre Dépôt
   ListWHLO_2: any[] = [];
   selectWHLO_2: string = '110';

   //Filtre emplacemnet
   ListWHSL: any[] = [];
   selectWHSL: string;

   //Filtre période
   FDAT: string;
   FDAT_API: number;
   TDAT: string;
   TDAT_API: number;

   //Valeur pour remplir la datagrid
   dataset: any[] = [];
   datasetZoom: any[] = [];
   ArrayDataZoom: any[] = []
   firstMonthRecepQty: number = 0;

   numPeriods: number;



   columnsListeStockEcheance = [
      { id: 'Periode', field: 'Periode', name: 'Période', width: 40, sortable: false },
      { id: 'STO1', field: 'STO1', name: 'Stock début', width: 30, sortable: false, filterType: 'text' },
      { id: 'ENTR', field: 'ENTR', name: 'Entrée', width: 30, sortable: false, filterType: 'text' },
      { id: 'RECE', field: 'RECE', name: 'Receptionée', width: 30, sortable: false, filterType: 'text' },
      { id: 'QOUT', field: 'QOUT', name: 'Sortie', width: 30, sortable: false, filterType: 'text' },
      { id: 'CONS', field: 'CONS', name: 'Consommation', width: 30, sortable: false, filterType: 'text' },
      { id: 'REGU', field: 'REGU', name: 'Régul', width: 30, sortable: false, filterType: 'text' },
      { id: 'CMDE', field: 'CMDE', name: 'Commande OA/OF', width: 30, sortable: false, filterType: 'text' },
      { id: 'RESE', field: 'RESE', name: 'Reservée', width: 30, sortable: false, filterType: 'text' },
      { id: 'DADF', field: 'DADF', name: 'DA/DF', width: 30, sortable: false, filterType: 'text' },

      { id: 'PERI', field: 'PERI', name: 'PERI', hidden: true, width: 30, sortable: false, filterType: 'text' },
      { id: 'ID', field: 'ID', name: '', hidden: true, sortable: false, formatter: Soho.Formatters.SelectionCheckbox },
      { id: 'AnneeMois', field: 'AnneeMois', hidden: true, name: 'AnneeMois', width: 40, sortable: false },
      { id: 'ITNO', field: 'ITNO', name: 'TOTAL', hidden: true, width: 30, sortable: false, filterType: 'text' },
   ];

   optionsDataGridListeStockEcheance: SohoDataGridOptions = {
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
      pagesize: 15,
      showPageSizeSelector: false,
      indeterminate: false,
      columns: this.columnsListeStockEcheance,
      dataset: [],
      emptyMessage: {
         title: 'Aucune donnée',
         icon: 'icon-empty-no-data'
      },
   };
   constructor(private APIService: BasicAPIService, private modalService: SohoModalDialogService, private userService: UserService) {
      super('stockEcheance');
   }

   ngOnInit(): void {
      this.logWarning('chargement Panel StockEchanécé');
      this.numPeriods = 12;

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
      this.getListWHSL();


      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() - 6);
      const month = currentDate.getMonth() + 1; // Les mois vont de 0 à 11
      const year = currentDate.getFullYear();
      // Format MMAAAA (avec le mois sur 2 chiffres)
      this.FDAT = `${month.toString().padStart(2, '0')}${year}`;

      const currentDate_2 = new Date();
      currentDate_2.setMonth(currentDate_2.getMonth() + 6);
      const month_2 = currentDate_2.getMonth() + 1; // Les mois vont de 0 à 11
      const year_2 = currentDate_2.getFullYear();
      // Format MMAAAA (avec le mois sur 2 chiffres)
      this.TDAT = `${month_2.toString().padStart(2, '0')}${year_2}`;


   }

   private setBusy(isBusy: boolean) {
      this.isBusy = isBusy;
   }

   /*
   loadStock() {
      if (this.ITNO_2 == '' || this.selectWHLO_2 == '') {
         alert("Le champ article et dépôt doit être renseigné")
         return;
      }
      this.basicdatagridListeStockEcheance.datagrid.dataset = [];
      this.ArrayDataZoom = [];
      this.dataset = [];
      //this.basicdatagridZoom.datagrid.dataset = [];
      //this.dataset = this.basicdatagridListeStockEcheance.datagrid.dataset;
      //this.datasetZoom = this.basicdatagridZoom.datagrid.dataset;



      forkJoin(
         {
            1: this.loadMITTRAFirstMonth(-8),
            2: this.loadMITTRAFirstMonth(-7),
            3: this.loadMITTRAFirstMonth(-6),
            4: this.loadMITTRAFirstMonth(-5),
            5: this.loadMITTRAFirstMonth(-4),
            6: this.loadMITTRAFirstMonth(-3),
            7: this.loadMITTRAFirstMonth(-2),
            8: this.loadMITTRAFirstMonth(-1),
            9: this.loadMITTRAFirstMonth(0),
            10: this.loadMITTRAFirstMonth(1),
            11: this.loadMITTRAFirstMonth(2),
            12: this.loadMITTRAFirstMonth(3),
         }

      ).subscribe({
         next: (response) => { //a enlever quand IES OK
            this.fillDatagrid();
            console.log("Zoom");
            console.log(this.ArrayDataZoom);
            //this.onRefreshDetail.emit('ok');
         }, error: (error) => {
            (this.busyIndicator as any).activated = false;
            this.logError('Failed to load items :' + JSON.stringify(error));
            alert('Error ' + JSON.stringify(error));
         }, complete: () => {
            // this.onRefreshDetail.emit('Maj faite');
            (this.busyIndicator as any).activated = false;
         }
      });

      this.cmppoa.getSUNO();

      //this.loadMMS080();

   }
      */

   /*SAV avant changementFiltre date
   loadStock(numPeriods: number) {
      this.numPeriods = 12;
      if (this.ITNO_2 == '') {
         alert("Le champ article  doit être renseigné");
         return;
      }
      (this.busyIndicator as any).activated = true;
      this.basicdatagridListeStockEcheance.datagrid.dataset = [];
      this.ArrayDataZoom = [];
      this.dataset = [];
      //this.basicdatagridZoom.datagrid.dataset = [];
      //this.dataset = this.basicdatagridListeStockEcheance.datagrid.dataset;
      //this.datasetZoom = this.basicdatagridZoom.datagrid.dataset;

      // Créer un objet dynamique pour le forkJoin
      let requests = {};
      for (let i = -numPeriods + 1; i <= numPeriods; i++) {
         requests[i + numPeriods] = this.loadMITTRAFirstMonth(i);
      }

      forkJoin(requests).subscribe({
         next: (response) => { // a enlever quand IES OK
            this.fillDatagrid();
            // console.log("Zoom");
            //console.log(this.ArrayDataZoom);
            //this.onRefreshDetail.emit('ok');
         }, error: (error) => {
            (this.busyIndicator as any).activated = false;
            this.logError('Failed to load items :' + JSON.stringify(error));
            alert('Error ' + JSON.stringify(error));
         }, complete: () => {
            // this.onRefreshDetail.emit('Maj faite');
            (this.busyIndicator as any).activated = false;
         }
      });

      this.cmppoa.getSUNO();

      //this.loadMMS080();
   }*/

   loadStock() {

      if (this.ITNO_2 == '') {
         alert("Le champ article  doit être renseigné");
         return;
      }

      this.FDAT_API = this.convertirDateVersDateApi(this.FDAT);

      this.TDAT_API = this.convertirDateVersDateApi(this.TDAT);

      (this.busyIndicator as any).activated = true;
      this.basicdatagridListeStockEcheance.datagrid.dataset = [];
      this.ArrayDataZoom = [];
      this.dataset = [];

      const startYear = Math.floor(this.FDAT_API / 100);
      const startMonth = this.FDAT_API % 100;

      const endYear = Math.floor(this.TDAT_API / 100);
      const endMonth = this.TDAT_API % 100 - 1;

      let currentYear = startYear;
      let currentMonth = startMonth - 1;

      let year = startYear;
      let month = startMonth;

      // Créer un objet dynamique pour le forkJoin
      let requests = {};
      let i = 0;

      while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
         //console.log("LECTURE DE BOUCLE currentYear ==> " + currentYear + " EndYear ==> " + endYear + " CurrentMonth => " + currentMonth + " EndMOnth ===> " + endMonth)
         // Calcul du décalage en mois par rapport à currentDate
         const monthOffset = (year - currentYear) * 12 + (month - currentMonth);

         requests[i] = this.loadMITTRAFirstMonth(currentMonth, currentYear);

         // Avance d’un mois
         if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
         } else {
            currentMonth++;
         }
         i++;
      }

      forkJoin(requests).subscribe({
         next: (response) => { // a enlever quand IES OK
            this.fillDatagrid();
            // console.log("Zoom");
            //console.log(this.ArrayDataZoom);
            //this.onRefreshDetail.emit('ok');
         }, error: (error) => {
            (this.busyIndicator as any).activated = false;
            this.logError('Failed to load items :' + JSON.stringify(error));
            alert('Error ' + JSON.stringify(error));
         }, complete: () => {
            // this.onRefreshDetail.emit('Maj faite');
            (this.busyIndicator as any).activated = false;
         }
      });

      //odin this.cmppoa.getSUNO();

      //this.loadMMS080();
   }

   /*loadMoreStock() {
      console.log("Nombre de periode " + this.numPeriods);
      this.loadStock(this.numPeriods + 6);
      this.numPeriods = this.numPeriods + 6;
   }*/


   /* SAV avant changement filtre date
   loadMITTRAFirstMonth(period: number): Observable<any> {
      let start = { value: "" };
      let end = { value: "" };
      let month = { value: "" };
      let yearMonth = { value: "" };

      this.setStartAndEndWithOffset(period - 3, start, end, month, yearMonth);

      //(this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         WHLO: this.selectWHLO_2,
         ITNO: this.ITNO_2,
         WHSL: this.selectWHSL,
         FDAT: start.value,
         TDAT: end.value,
      };
      inputFields = newrecord;
      let subscription: Subscription;

      return new Observable((observer) => {
         this.APIService.GetFieldValue('STOCKECHMI', 'LstMITTRA', outputFields, inputFields, 100).subscribe({
            next: (response) => {
               this.datasetZoom = response.items
               this.ArrayDataZoom.push(this.datasetZoom);
               //console.log(this.datasetZoom);
               if (response.items.length == 0) {
                  // Crée un nouvel objet MIRecord
                  const newRecord = new MIRecord();
                  newRecord.setString('Periode', month.value);
                  newRecord.setString('AnneeMois', yearMonth.value);
                  newRecord.setString('ITNO', this.ITNO_2);
                  // Ajoute le `newRecord` dans `items`
                  response.items.push(newRecord);
                  this.dataset.push(response.items[0]);
               } else {
                  for (let i = 0; i < response.items.length; i++) {
                     if (response.items[i].ITNO != 'Total') {
                        continue;
                     }
                     response.items[i].Periode = month.value;
                     response.items[i].AnneeMois = yearMonth.value;
                     this.dataset.push(response.items[i]);

                  }
               }
               // this.dataset[index] = response.items
               observer.next(this.firstMonthRecepQty);
            },
            error: (error) => {
               //  (this.busyIndicator as any).activated = false;
               this.logError('Failed to load items: ' + JSON.stringify(error));
               observer.error(error);
            },
            complete: () => {
               //  (this.busyIndicator as any).activated = false;
               observer.complete();
            }
         });
      });
   }*/

   loadMITTRAFirstMonth(monthOffset: number, date: number): Observable<any> {
      let start = { value: "" };
      let end = { value: "" };
      let month = { value: "" };
      let yearMonth = { value: "" };

      this.setStartAndEndWithOffset(monthOffset, date, start, end, month, yearMonth);

      //(this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let newrecord = {
         WHLO: this.selectWHLO_2,
         ITNO: this.ITNO_2,
         WHSL: this.selectWHSL,
         FDAT: start.value,
         TDAT: end.value,
      };
      inputFields = newrecord;
      let subscription: Subscription;

      return new Observable((observer) => {
         this.APIService.GetFieldValue('STOCKECHMI', 'LstMITTRA', outputFields, inputFields, 100).subscribe({
            next: (response) => {
               //On garde la réponse avec tout le détail pour l'affichage du zoom
               this.datasetZoom = response.items
               for (let i = 0; i < response.items.length; i++) {
                  let trdt = response.items[i].TRDT;
                  let annee = trdt.substring(0, 4);
                  let mois = trdt.substring(4, 6);
                  let jour = trdt.substring(6, 8);

                  response.items[i].TRDT = `${jour}${mois}${annee}`;

               }
               this.ArrayDataZoom.push(this.datasetZoom);

               if (response.items.length == 0) {
                  // Crée un nouvel objet MIRecord
                  const newRecord = new MIRecord();
                  newRecord.setString('Periode', month.value);
                  newRecord.setString('AnneeMois', yearMonth.value);
                  newRecord.setString('ITNO', this.ITNO_2);
                  // Ajoute le `newRecord` dans `items`
                  response.items.push(newRecord);
                  this.dataset.push(response.items[0]);
               } else {
                  for (let i = 0; i < response.items.length; i++) {
                     if (response.items[i].ITNO != 'Total') {
                        continue;
                     }
                     response.items[i].Periode = month.value;
                     response.items[i].AnneeMois = yearMonth.value;
                     this.dataset.push(response.items[i]);

                  }
               }
               // this.dataset[index] = response.items
               observer.next(this.firstMonthRecepQty);
            },
            error: (error) => {
               //  (this.busyIndicator as any).activated = false;
               this.logError('Failed to load items: ' + JSON.stringify(error));
               observer.error(error);
            },
            complete: () => {
               //  (this.busyIndicator as any).activated = false;
               observer.complete();
            }
         });
      });
   }

   loadMMS080() {
      this.cmpMMS080.loadListMMS080(this.ITNO_2, this.selectWHLO_2);

   }

   fillDatagrid() {
      //on tri par ordre croissant sur AnnéeMois
      this.dataset.sort((a, b) => {
         return parseInt(a.AnneeMois) - parseInt(b.AnneeMois);
      });
      //console.log("Apres tri");
      //console.log(this.dataset);
      let newStock = 0;
      for (let i = 0; i < this.dataset.length; i++) {
         this.dataset[i].NEWDATE = "TEST";

         if (i !== 0) {
            this.dataset[i].STO1 = newStock.toFixed(2);
         }

         if (Number(this.dataset[i].ENTR) == 0 && Number(this.dataset[i].QOUT) == 0 && Number(this.dataset[i].REGU) == 0) {

         } else {
            newStock += Number(this.dataset[i].ENTR) + Number(this.dataset[i].QOUT) + Number(this.dataset[i].REGU) || 0;
         }
      }


      this.basicdatagridListeStockEcheance.datagrid.dataset = this.dataset
   }

   onevent(e: any, TypeEvent: string) {
      if (e.column != '0') {
         this.getZoomOfOneColunm(e);
      } else {
         console.log("All Column")
         this.getZoomOfAllColunm(e);
      }

   }


   getZoomOfOneColunm(e: any) {
      let field = '';
      let datasetToPass = [];
      let showModal = false;
      let periodeZoom = e.item.AnneeMois;

      const index = this.ArrayDataZoom.findIndex(row => row[0].PERI === periodeZoom);
      datasetToPass = this.ArrayDataZoom[index];
      const columnMapping = {
         '2': 'ENTR',
         '3': 'RECE',
         '4': 'QOUT',
         '5': 'CONS',
         '6': 'REGU',
         '7': 'CMDE',
         '8': 'RESE',
         '9': 'DADF',
      };

      const columnNameMapping = {
         '2': 'Quantité entrée',
         '3': 'Quantité réceptionée',
         '4': 'Quantité sortie',
         '5': 'Quantité consomée',
         '6': 'Quantité régul',
         '7': 'Quantité commandée',
         '8': 'Quantité Reservée',
         '9': 'Quantité planifiée'
      };
      if (e.column !== '0' && columnMapping[e.column]) {
         field = columnMapping[e.column];
         datasetToPass = datasetToPass.filter(row => row[field] !== "0" && row[field] !== "");
         showModal = true;
         for (let i = 0; i < datasetToPass.length; i++) {
            datasetToPass[i].FIELD = datasetToPass[i][field];
         }
         datasetToPass.pop(); // Supprime le dernier élément
         this.title = columnNameMapping[e.column];

         if (showModal) {
            const dialogRef = this.modalService
               .modal(ModalDialogOneColumnComponent, this.placeholderOneColumn, { fullsize: 'always' })
               .buttons(
                  [{
                     text: 'FERMER', click: () => {
                        dialogRef.close('FERMER');
                     }
                  },])
               .title(this.title)
               .open()
               .afterClose((result: any) => {
                  this.closeResult = result;
               });
            dialogRef.componentDialog.dataset = datasetToPass;

            dialogRef.componentDialog.field = field;
         }
      }
   }

   getZoomOfAllColunm(e: any) {
      let field = '';
      let datasetToPass = [];
      let periodeZoom = e.item.AnneeMois;
      const index = this.ArrayDataZoom.findIndex(row => row[0].PERI === periodeZoom);
      datasetToPass = this.ArrayDataZoom[index];
      console.log(datasetToPass);
      // datasetToPass.pop(); // Supprime le dernier élément

      const dialogRef = this.modalService
         .modal(ModalDialogAllColumnComponent, this.placeholderAllColumn, { fullsize: 'always' })
         .buttons(
            [{
               text: 'FERMER', click: () => {
                  dialogRef.close('FERMER');
               }
            },])
         .title(this.title)
         .open()
         .afterClose((result: any) => {
            this.closeResult = result;
         });
      dialogRef.componentDialog.dataset = datasetToPass;

   }

   getListWHLO() {
      this.ListWHLO_2 = [];
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
            this.ListWHLO_2 = response.items;
            this.selectWHLO_2 = this.USERWHLO;
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

   // obtenir les dates de début et de fin d'un mois avec un décalage
   setStartAndEndWithOffset(monthOffset: number, date: number, start: { value: string }, end: { value: string }, monthName: { value: string }, yearMonth: { value: string }) {
      //console.log("Choix des dates");
      const currentDate = new Date();

      // Appliquer le décalage de mois
      currentDate.setFullYear(date)
      currentDate.setMonth(monthOffset);
      //console.log(currentDate.getMonth());
      //console.log(currentDate.getFullYear());

      // Premier jour du mois après le décalage
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Dernier jour du mois après le décalage
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Liste des mois
      const monthsInFrench = [
         "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
         "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];


      // Formatage des dates au format AAAA/MM/JJ
      const formatDate = (date: Date): string => {
         const year = date.getFullYear();
         const month = (date.getMonth() + 1).toString().padStart(2, '0');
         const day = date.getDate().toString().padStart(2, '0');
         return `${year}${month}${day}`;
      };

      // Alimenter les variables start et end
      start.value = formatDate(firstDay);
      end.value = formatDate(lastDay);

      let month = currentDate.getMonth() + 1

      // Récupérer le nom du mois en français
      monthName.value = `${monthsInFrench[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      yearMonth.value = `${currentDate.getFullYear()}${month.toString().padStart(2, '0')}`;

   }

   convertirDateVersDateApi(date: string): number {
      const Str = date.toString().padStart(6, '0'); // Ajoute un 0 au début si nécessaire

      if (Str.length !== 6) {
         throw new Error("Le format de la date doit être AAAAMM (6 chiffres)");
      }

      const annee = Str.substring(2, 6);
      const mois = Str.substring(0, 2);

      const dateAPI = `${annee}${mois}`;
      return parseInt(dateAPI, 10);
   }

   public source = (term: string, response: any) => {
      this.SearchItem = [];

      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];

      let newrecord = {
         SQRY: "SearchFields:ITNO;ITDS;FUDS " + term + "* NOT ITTY:7FA",
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
         this.ITNO_2 = event.target.value;
      }
   }

   onSelectedITNO(event): void {
      if (event[2].value === '') return
      this.ITNO_2 = event[2].value;
      this.ITDS = event[2].label;
   }

   onClear(event: any): void {
      this.ITNO_2 = '';

   }


}
