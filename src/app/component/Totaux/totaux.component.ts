import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { MIRecord, MIResponse } from '@infor-up/m3-odin/dist/mi/runtime';
import { SohoBusyIndicatorDirective } from 'ids-enterprise-ng';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { BasicGridComponent } from 'src/app/basic/grid/basicgrid.component';
import { BasicAPIService } from 'src/app/services/basicAPI.service';


@Component({
   selector: 'cmp-totaux',
   templateUrl: './totaux.component.html',
   styleUrls: ['./totaux.component.css']
})


export class totauxComponent extends CoreBase implements OnInit {
   @ViewChild(SohoBusyIndicatorDirective, { static: true }) busyIndicator?: SohoBusyIndicatorDirective;
   @Input() selectWHLO_2;
   @Input() ITNO_2;
   @Input() selectWHSL;


   //Filtre période
   FDAT: string;
   FDAT_API: string;
   TDAT: string;
   TDAT_API: string;

   //Zone des totaux
   sumENTR: number;
   sumRECE: number;
   sumQOUT: number;
   sumCONS: number;
   sumREGU: number;
   sumCMDE: number;
   sumRESE: number;
   sumDADF: number;

   //Zone des moyennes
   avgENTR: number;
   avgRECE: number;
   avgQOUT: number;
   avgCONS: number;
   avgREGU: number;



   constructor(private APIService: BasicAPIService) {
      super('totaux');
   }

   ngOnInit(): void {
      this.logWarning('chargement Panel Totaux');
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

   loadTotaux() {

      this.FDAT_API = this.convertirDateVersDateApi(this.FDAT);
      this.TDAT_API = this.convertirDateVersDateApi(this.TDAT);


      console.log("test API TOTAUX");
      //(this.busyIndicator as any).activated = true;
      let inputFields: any;
      let outputFields: any[] = [];
      let reponse: any[];
      let newrecord = {
         WHLO: this.selectWHLO_2,
         ITNO: this.ITNO_2,
         WHSL: this.selectWHSL,
         FDAT: this.getFirstDayOfMonth(this.FDAT),
         TDAT: this.getLastDayOfMonth(this.TDAT)
      };
      inputFields = newrecord;
      let subscription: Subscription;

      subscription = this.APIService.GetFieldValue('STOCKECHMI', 'getTotal', outputFields, inputFields, 0).subscribe({
         next: (response) => {
            reponse = response.items;

            this.sumENTR = reponse[0].ENTR;
            this.sumRECE = reponse[0].RECE;
            this.sumQOUT = reponse[0].QOUT;
            this.sumCONS = reponse[0].CONS;
            this.sumREGU = reponse[0].REGU;
            this.sumCMDE = reponse[0].CMDE;
            this.sumCMDE = reponse[0].CMDE;
            this.sumRESE = reponse[0].RESE;
            this.sumDADF = reponse[0].DADF;
            this.avgENTR = reponse[0].MENT;
            this.avgRECE = reponse[0].MREC;
            this.avgQOUT = reponse[0].MOUT;
            this.avgCONS = reponse[0].MCON;
            this.avgREGU = reponse[0].MREG;

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


   getFirstDayOfMonth(period: string): string {
      const periodStr = period.toString();
      if (periodStr.length !== 6) {
         throw new Error("Le format du period doit être MMAAAA.");
      }

      const year = periodStr.substring(2, 6);
      const month = periodStr.substring(0, 2);

      // Retourne le premier jour du mois au format AAAAMMJJ
      return `${year}${month}01`;
   }

   getLastDayOfMonth(period: string): string {
      const periodStr = period.toString();
      if (periodStr.length !== 6) {
         throw new Error("Le format du period doit être MMAAAA.");
      }

      const year = parseInt(periodStr.substring(2, 6), 10);
      const month = parseInt(periodStr.substring(0, 2), 10);

      // Création d'une date pour le mois suivant, puis on recule d'un jour pour obtenir le dernier jour du mois en cours
      const lastDayDate = new Date(year, month, 0);
      const day = lastDayDate.getDate().toString().padStart(2, "0");

      // Retourne la date au format AAAAMMJJ
      return `${year}${month.toString().padStart(2, "0")}${day}`;
   }



   convertirDateVersDateApi(date: string): string {
      const Str = date.padStart(6, '0'); // Ajoute un 0 au début si nécessaire

      if (Str.length !== 6) {
         throw new Error("Le format de la date doit être AAAAMM (6 chiffres)");
      }

      const annee = Str.substring(2, 6);
      const mois = Str.substring(0, 2);

      const dateAPI = `${annee}${mois}`;
      return dateAPI;
   }

}
