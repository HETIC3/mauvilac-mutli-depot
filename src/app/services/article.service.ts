import { Injectable } from '@angular/core';
import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';
import { map, Observable, throwError } from 'rxjs';
import { ArticleRow } from '../interface/fournisseur-row';


@Injectable({
   providedIn: 'root'
})
export class ArticleService {

   constructor(private miService: MIService) { }

   list(): Observable<ArticleRow[]> {
      const request: IMIRequest = {
         program: "CMS100MI",
         transaction: "LstMSH_MT_4",
         outputFields: ["MMITNO", "MMITDS"],
         maxReturnedRecords: 1000000,
      };

      return this.miService.execute(request).pipe(map((response: IMIResponse) => {
         if (response.hasError())
            throwError(() => new Error(response.errorMessage));
         return response.items;
      }));

   }
}
