import { Injectable } from '@angular/core';
import { AbstractApiService } from './abstract.service';
import { MIService,UserService } from '@infor-up/m3-odin-angular';
import { Observable } from 'rxjs';
import { IMIResponse, IMIRequest, MIRecord } from '@infor-up/m3-odin';


@Injectable()
export class BasicAPIService extends AbstractApiService{
        constructor(protected miService: MIService, protected userService: UserService) {
            super(miService);
        }


        GetFieldValue(programAPI: string, transactionAPI: string, outputFieldsAPI: any[],
                      inputFieldsAPI: MIRecord, maxRecords= 0): Observable<IMIResponse> {

        const request: IMIRequest = {
            program: programAPI,
            transaction: transactionAPI,
            outputFields: outputFieldsAPI,
            maxReturnedRecords: maxRecords,
            record: inputFieldsAPI
            };
        return this.execute(request);
        }

        GetUserContext(): Observable<any>{
            let user: any;
            let userContext =new Observable(observer => {
                this.userService.getUserContext().subscribe((userContext: any) => {
                    //observer.next(userContext);
                    user=userContext;
                    const outputFieldsAPI=['WHTY'] ;
                    let  newrecord: any ={WHLO : user.WHLO};
                    this.GetFieldValue('MMS005MI','GetWarehouse',outputFieldsAPI,newrecord).subscribe((response) => {
                    if (!response.hasError()) {
                        user.WHTY=response.item.WHTY;
                        observer.next(user);
                        observer.complete();
                       } 
                   
                    });
                });
            });
        return userContext;
        }

        ExportMIValue(tableM3: string, inputFields:string='*', filterFields:string, maxRecords:number= 0): Observable<IMIResponse> {
        // exemple: ExportMIValue('CIADDR', '*', "where OAADK2 = '108'", 0)
            const request: IMIRequest = {
                program: 'EXPORTMI',
                transaction: 'Select',
                maxReturnedRecords: maxRecords,
                record: { SEPC: ';',
                        HDRS: 1,
                        QERY: inputFields+ ' from ' + tableM3 + ' ' + filterFields
                        }
                };
            
                /** 
            this.execute(request).subscribe((response) => {
                if (response.hasError()) {

                }
                }, (error) => {
                    
            });
            */

            return this.execute(request);

        }

        /**  explication API EXPORTMI
        * Le filtre utilisé pour sélectionner les informations est rédigé dans une syntaxe de type SQL.
        * Remarque
        * Il ne s'agit pas d'une syntaxe SQL stricte mais elle partage une syntaxe similaire. Les opérations telles que IN(), 'commander par', etc., ne sont pas prises en charge.
        *
        * Il est possible de définir un index spécifique pour la table qui contrôlera le tri de la liste retournée. Si aucun index n'est spécifié, l'index 00 est utilisé. Si un filtrage est effectué, il est recommandé d'utiliser un index correspondant aux champs de filtre pour des raisons de performance.
        * Les opérateurs 'from', 'where', 'and' et 'or' doivent être écrits en minuscule. Ils doivent également être dotés d'un espace vide unique de chaque côté.
        * Les opérateurs '=', '<>' etc., doivent contenir un espace vide unique de chaque côté.
        * Des opérateurs spéciaux, tels que 'count(*)', peuvent être utilisés. Le résultat est un nombre égal au nombre d'enregistrements conforme à la sélection de filtre.
        * Remarque
        * L'opérateur 'count(*)' renvoie le nombre d'enregistrements pour la division actuelle. Pour comptabliser tous les enregistrements de la table, vous devez utiliser l'opérateur 'count(#)'.
        *
        * Les noms des champs doivent être rédigés en lettres majuscules et contenir le préfixe de la table. Autrement dit, 'MMITNO' est correct mais 'ITNO' ne l'est pas.
        * Pour des raisons de performance, il est recommandé de toujours renseigner les champs individuels. Cependant, à titre d'exception, il est possible d'utiliser l'opérateur général '*' pour sélectionner la totalité des champs. Tous les champs pouvant tenir dans la transaction sont alors inclus dans les informations retournées.
        * Des valeurs de comparaison peuvent être saisies avec des guillements ('') entre elles, quel que soit le type de valeur (chaîne, valeur numérique, etc.).
        * Le paramètre (SEPC) permet de définir le séparateur entre les valeurs des champs. Si ce paramètre n'est pas renseigné, un fichier plat avec des espaces vides de fin est créé. Si vous saisissez un caractère, ce caractère est utilisé en guise de séparateur et les espaces vides éventuels sont exclus des valeurs. Si le caractère est '*' ou "#", les valeurs de champ se voient ajouter le nom de champ en guise de préfixe (le même cas s'applique à toutes les lignes du résultat) suivi d'un espace.
        * Si le paramètre d'en-tête (HDRS) est défini sur 1, le premier enregistrement retourné contient les noms des champs mis en forme de la même manière que celle définie pour le paramètre de séparateur.
        * Exemples de chaîne d'entrée :
        * Remarque
        * Espace vide jusqu'à la position 16, contenant le paramètre de séparateur (SEPC). La position 17 contient alors le paramètre d'en-tête (HDRS).
        *
        * Avec des champs spécifiés : Sélectionnez ;1MMSTAT,MMITNO,MMITDS,MMRESP,MMDCCD,MMUNMS,MMITGR,MMITCL from MITMAS where MMSTAT = 10 or MMSTAT = 90 and MMITCL = 'Y001'.
        * Sans champs spécifiés : Sélectionnez ;1* à partir de CEMAIL où CBEMTP = 04 et CBRGDT <= 20160111.
        * Avec des champs spécifiés et un index spécifié (notez que les valeurs de filtre sont conformes à l'index) : Sélectionnez ;1MMSTAT,MMITNO,MMITDS,MMRESP,MMDCCD,MMUNMS,MMITGR,MMITCL from MITMAS80 where MMITTY = 'D02' and MMSTAT = '50'.
        */
}
