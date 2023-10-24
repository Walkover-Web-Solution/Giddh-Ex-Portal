import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { CompanyService } from '../../services/company.service';
import { CustomActions } from '../custom-actions';
import { COMMON_ACTIONS } from './common.const';
import { BaseResponse } from '../../models/BaseResponse';

@Injectable()

export class CompanyActions {
    public static SET_ACTIVE_COMPANY = 'CompanyActiveCompany';
    public static SET_ACTIVE_COMPANY_DATA = 'SET_ACTIVE_COMPANY_DATA';
    public static RESET_ACTIVE_COMPANY_DATA = 'ResetActiveCompanyData';
    public static GET_COMPANY_USER = 'GET_COMPANY_USER';
    public static GET_COMPANY_USER_RESPONSE = 'GET_COMPANY_USER_RESPONSE';


    // public getCompanyUser$: Observable<Action> = createEffect(() => this.action$
    //     .pipe(
    //         ofType(CompanyActions.GET_COMPANY_USER),
    //         switchMap((action: CustomActions) => this._companyService.getCompanyUser(action.payload)),
    //         map(response => {
    //             return this.getCompanyUserResponse(response);
    //         })));

    public getCompanyUserResponse$: Observable<Action> = createEffect(() => this.action$
        .pipe(
            ofType(CompanyActions.GET_COMPANY_USER_RESPONSE),
            map((action: CustomActions) => {
                if (action.payload?.status === 'error') {
                    // this._toasty.errorToast(action.payload.message, action.payload.code);
                }
                return { type: 'EmptyAction' };
            })));

    constructor(
        private action$: Actions,
        private _companyService: CompanyService
    ) {
    }

    public ResetApplicationData(): CustomActions {
        return {
            type: COMMON_ACTIONS.RESET_APPLICATION_DATA
        };
    }

    /**
     * This will set the active company data in store
     *
     * @param {*} data
     * @returns {CustomActions}
     * @memberof CompanyActions
     */
    public setActiveCompanyData(data: any): CustomActions {
        return {
            type: CompanyActions.SET_ACTIVE_COMPANY_DATA,
            payload: data
        };
    }

    /**
     * This will initiate get company uer api
     *
     * @param {*} data
     * @returns {CustomActions}
     * @memberof CompanyActions
     */
    public getCompanyUser(data: any): CustomActions {
        return {
            type: CompanyActions.GET_COMPANY_USER,
            payload: data
        };
    }

    /**
     * This will set the company uer data in store
     *
     * @param {BaseResponse<any, string>} value
     * @returns {CustomActions}
     * @memberof CompanyActions
     */
    public getCompanyUserResponse(value: BaseResponse<any, string>): CustomActions {
        return {
            type: CompanyActions.GET_COMPANY_USER_RESPONSE,
            payload: value
        };
    }

    /**
     * This will reset the active company data in store
     *
     * @param {*} data
     * @returns {CustomActions}
     * @memberof CompanyActions
     */
    public resetActiveCompanyData(): CustomActions {
        return {
            type: CompanyActions.RESET_ACTIVE_COMPANY_DATA,
            payload: null
        };
    }
}
