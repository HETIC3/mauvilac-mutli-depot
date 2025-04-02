import { IMIRequest, IMIResponse, IMIService } from '@infor-up/m3-odin';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

Injectable();
export abstract class AbstractApiService {

    constructor(protected miService: IMIService) {

    }

    protected execute(miRequest: IMIRequest, record?: any): Observable<IMIResponse> {
        const request = { ...miRequest };
        if (record) {
            request.record = record;
        }
        return this.miService.execute(request);
    }
}
