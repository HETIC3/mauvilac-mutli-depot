export interface FieldsM3API {
    name: string;
    program: string;
    transaction: string;
    text: string;
    value: string;
    maxReturnedRecords: number;
    record: any;
}

export class ListFieldsService {

    fields: FieldsM3API[] = [
        { name: 'RESP', program: 'MNS150MI', transaction: 'LstUserData', value: 'USID', text: 'TX40', maxReturnedRecords: 0, record: {}},
        { name: 'FWNO', program: 'CRS620MI', transaction: 'SearchSupplier', value: 'SUNO', text: 'SUNM', maxReturnedRecords: 0,
        record: {SQRY: 'SUTY:5'}},
        { name: 'TRCA', program: 'DRS013MI', transaction: 'Lst', value: 'TRCA', text: 'TX15', maxReturnedRecords: 0, record: {}},
        { name: 'TSID', program: 'MDBREADMI', transaction: 'LstDRTRSR00', value: 'TSID', text: 'TX15', maxReturnedRecords: 0, record: {}},
        { name: 'PLGR', program: 'PDS010MI', transaction: 'List', value: 'PLGR', text: 'PLNM', maxReturnedRecords: 0, record: {}},
        { name: 'STRT', program: 'CRS175MI', transaction: 'LstGeneralCode', value: 'STKY', text: 'TX15', maxReturnedRecords: 0, record: {STCO: 'STRT'}},
        { name: 'WHLO', program: 'MMS005MI', transaction: 'LstWarehouses', value: 'WHLO', text: 'WHNM', maxReturnedRecords: 0, record: {}},
    ];


    GetFieldValue(name: string): FieldsM3API {
        let record: FieldsM3API;
        this.fields.forEach(element => {
          if (element.name === name) {
            record = element;
          }
        });

        return record;
    }

}
