import { UpperCasePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
   providedIn: 'root'
})
export class ValidatorService {

   constructor() { }

   formValidator(voyageListValidator: Set<string>, fieldName: string): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
         if (control.value && !voyageListValidator.has(control.value))
            return { errorMessage: `Le ${fieldName} ${control.value} n'existe pas.` };
         return null;
      };
   }


}
