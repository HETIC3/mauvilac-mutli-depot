import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CoreBase, IBookmark, IUserContext } from '@infor-up/m3-odin';
import { SohoBusyIndicatorDirective } from 'ids-enterprise-ng';
import { ApplicationService, UserService } from '@infor-up/m3-odin-angular';
import { Subscription } from 'rxjs';
import { BasicGridComponent } from 'src/app/basic/grid/basicgrid.component';
import { BasicAPIService } from 'src/app/services/basicAPI.service';
import { Bookmark } from '@infor-up/m3-odin/dist/form/base';


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

   userContext = {} as IUserContext;

   //Filtre Dépôt
   ListWHLO: any[] = [];
   FWHL: string;
   TWHL: string;

   //Filtre type d'Ordre
   ListORTY: any[] = [];
   ORTY: string;

   //Tableau des autorisations de l'utilisateur
   ListORTY_autorisations: any[] = [];


   DLDT: string;
   PPQT: string;

   //Champ de la liste selectionnée
   from_WHLO_list: string;
   to_WHLO_list: string;
   ITNO_list: string;
   DLDT_list: string;
   PLPN_list: string;
   GETY_list: string;


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
      { id: 'DODLDT', field: 'DODLDT', name: 'Date planif', width: 20 },
      { id: 'DOPPQT', field: 'DOPPQT', name: 'Qte planif', width: 10 },
      { id: 'DOGETY', field: 'DOGETY', hidden: true, name: 'ref', width: 10 },

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




   constructor(private APIService: BasicAPIService, private applicationService: ApplicationService, private userService: UserService) {
      super('pod');
   }

   ngOnInit(): void {
      this.logWarning('chargement Panel POD');
      this.getListWHLO();
      this.getListORTY();
      this.userService.getUserContext().subscribe((userContext: IUserContext) => {

         this.logInfo('onClickLoad: Received user context');
         this.userContext = userContext;
         this.USID = this.userContext.USID;
         console.log(this.userContext);
         this.getAutorization();
      }, (error) => {
         this.logError('Unable to get userContext ' + error);
      });
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

   getAutorization() {
      this.ListORTY_autorisations = [];
      (this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];

      let newrecord = {
         ATAURE: this.USID,
      };

      inputFields = newrecord;
      let subscription: Subscription;
      subscription = this.APIService.GetFieldValue('CMS100MI', 'LstMSH_MT_7', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            this.ListORTY_autorisations = response.items;
            console.log('Autorisation de l\'utilisateur :');
            console.log(this.ListORTY_autorisations);
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

      if (!this.checkAutorization(this.ORTY)) {
         alert("Vous n'avez pas l'autorisation de créer ce POD");
         return;
      } else {
         console.log("L'utilisateur a l'autorisation de créer ce POD");
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
      // if (this.ITNOSelected !== '') {
      //    let query: string = 'mforms://_automation?data=%3c%3fxml+version%3d%221.0%22+encoding%3d%22utf-8%22%3f%3e%3csequence%3e%3cstep+command%3d%22RUN%22+value%3d%22DPS170%22+%2f%3e%3cstep+command%3d%22AUTOSET%22%3e%3cfield+name%3d%22WWQTTP%22%3e70%3c%2ffield%3e%3c%2fstep%3e%3cstep+command%3d%22AUTOSET%22%3e%3cfield+name%3d%22W1OBKV%22%3e'
      //       + this.ITNOSelected + '%3c%2ffield%3e%3c%2fstep%3e%3cstep+command%3d%22KEY%22+value%3d%22ENTER%22+%2f%3e%3c%2fsequence%3e';
      //    this.applicationService.launch(query);
      // }
      if (this.ITNOSelected !== '') {
         let bookmark: IBookmark = {
            program: "DPS170",
            table: "MDOPLP",
            keyNames: "DOCONO,DOPLPN,DOPLPS",
            fieldNames: "W1OBKV,W2OBKV,W3OBKV,W4OBKV,W5OBKV,W6OBKV",
            sortingOrder: "70",
            panel: "B",

         };

         bookmark.values = {
            DOCONO: '200',
            W1OBKV: this.from_WHLO_list,
            W2OBKV: this.to_WHLO_list,
            W3OBKV: this.GETY_list,
            W4OBKV: this.DLDT_list,
            W5OBKV: this.ITNO_list,
            W6OBKV: this.PLPN_list


         };


         let url: string = Bookmark.toUri(bookmark);
         this.applicationService.launch(url);
         console.log(url);
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
            // Ne garder que les articles avec le même dépôt de destination
            response.items = response.items.filter(item => item.DOTWHL === this.WHLOSelected);
            console.log(this.WHLOSelected);
            // Format DODLDT de AAAAMMJJ à JJMMAAAA
            response.items = response.items.map(item => {
               if (item.DODLDT && /^\d{8}$/.test(item.DODLDT)) {
                  const yyyy = item.DODLDT.substr(0, 4);
                  const mm = item.DODLDT.substr(4, 2);
                  const dd = item.DODLDT.substr(6, 2);
                  item.DODLDT = `${dd}${mm}${yyyy}`;
               }
               return item;
            });

            // Tri chronologique sur DODLDT (JJMMAAAA)
            response.items.sort((a, b) => {
               const toIso = (d: string) => {
                  if (!d || d.length !== 8) {
                     return '';
                  }
                  const jour = d.substr(0, 2);
                  const mois = d.substr(2, 2);
                  const an = d.substr(4, 4);
                  return `${an}-${mois}-${jour}`;
               };
               return toIso(a.DODLDT).localeCompare(toIso(b.DODLDT));
            });

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

   onevent(e: any, TypeEvent: string) {
      this.logDebug('Event :' + TypeEvent + ' - ' + JSON.stringify(e));
      if (TypeEvent === 'sendDataClick') {
         console.log('click sur datagrid POD');
         console.log(e);
         this.lineSelected = e;
         this.dataselect = [];
         this.dataselect.push(e);
         // Convertit DODLDT AAAAMMJJ ou JJMMAAAA en JJMMAA
         const rawDate = e.item.DODLDT || '';
         if (/^\d{8}$/.test(rawDate)) {
            const jour = rawDate.substr(0, 2);
            const mois = rawDate.substr(2, 2);
            const annee2 = rawDate.substr(6, 2);
            this.DLDT_list = `${jour}${mois}${annee2}`;
         } else if (/^\d{6}$/.test(rawDate)) {
            this.DLDT_list = rawDate;
         } else {
            this.DLDT_list = rawDate;
         }
         this.ITNO_list = e.item.DOITNO;
         this.from_WHLO_list = e.item.DOFWHL;
         this.to_WHLO_list = e.item.DOTWHL;
         this.PLPN_list = e.item.DOPLPN;
         this.GETY_list = e.item.DOGETY;

         console.log(this.DLDT_list);
         console.log(this.ITNO_list);
         console.log(this.from_WHLO_list);
         console.log(this.to_WHLO_list);
      }

   }

   unloadPOD() {
      console.log("unloadPOD");
      this.basicdatagridListePOD.datagrid.dataset = [];
   }

   checkAutorization(ORTY: string): boolean {
      console.log('Vérification autorisation pour le type d\'ordre : ' + ORTY);
      if (!ORTY) return false;
      for (let auth of this.ListORTY_autorisations) {
         let attrts = [auth.ATTRT1, auth.ATTRT2, auth.ATTRT3, auth.ATTRT4, auth.ATTRT5, auth.ATTRT6, auth.ATTRT7, auth.ATTRT8].filter(a => a && a.trim());
         if (auth.ATIOEX == 1) {
            if (attrts.includes(ORTY)) {
               return true;
            } else {
               return false;
            }
         }
         if (auth.ATIOEX == 2) {
            if (attrts.includes(ORTY)) {
               return false;
            } else {
               return true;
            }
         }
      }
      // Si aucune règle ne correspond, on considère que l'utilisateur a  l'autorisation
      return true;

   }


}
