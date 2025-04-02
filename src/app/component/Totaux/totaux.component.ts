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
   TDAT: string;

   //Zone des totaux
   sumENTR: number;
   sumRECE: number;
   sumQOUT: number;
   sumCONS: number;
   sumREGU: number;
   sumCMDE: number;
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
      this.logWarning('chargement Panel multiDépôt');
      this.FDAT = this.getStartPeriod();
      this.TDAT = this.getEndPeriod();
      //this.getListWHLO();
   }

   loadTotaux() {
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
         throw new Error("Le format du period doit être AAAAMM.");
      }

      const year = periodStr.substring(0, 4);
      const month = periodStr.substring(4, 6);

      // Retourne le premier jour du mois au format AAAAMMJJ
      return `${year}${month}01`;
   }

   getLastDayOfMonth(period: string): string {
      const periodStr = period.toString();
      if (periodStr.length !== 6) {
         throw new Error("Le format du period doit être AAAAMM.");
      }

      const year = parseInt(periodStr.substring(0, 4), 10);
      const month = parseInt(periodStr.substring(4, 6), 10);

      // Création d'une date pour le mois suivant, puis on recule d'un jour pour obtenir le dernier jour du mois en cours
      const lastDayDate = new Date(year, month, 0);
      const day = lastDayDate.getDate().toString().padStart(2, "0");

      // Retourne la date au format AAAAMMJJ
      return `${year}${month.toString().padStart(2, "0")}${day}`;
   }

   getStartPeriod(): string {
      const currentDate = new Date();

      // On calcule le mois précédent en soustrayant 5 mois
      currentDate.setMonth(currentDate.getMonth() - 8);

      const year = currentDate.getFullYear().toString();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");

      // Retourne la date au format AAAAMM
      return `${year}${month}`;
   }

   getEndPeriod(): string {
      const currentDate = new Date();

      // On calcule le mois précédent en soustrayant 5 mois
      currentDate.setMonth(currentDate.getMonth() + 3);

      const year = currentDate.getFullYear().toString();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");

      // Retourne la date au format AAAAMM
      return `${year}${month}`;
   }

}
