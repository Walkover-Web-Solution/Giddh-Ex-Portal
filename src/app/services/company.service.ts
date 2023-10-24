import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpWrapperService } from './http-wrapper.service';
import { Inject, Injectable, Optional } from '@angular/core';
import { GeneralService } from './general.service';
import { GiddhErrorHandler } from './catch-manager/catchmanger';
import { BaseResponse } from '../models/BaseResponse';
import { UserDetails } from '../models/loginModels';

@Injectable()
export class CompanyService {
    private companyUniqueName: string;

    constructor(private errorHandler: GiddhErrorHandler, private http: HttpWrapperService, private generalService: GeneralService,
     ) {
        this.companyUniqueName = this.generalService.companyUniqueName;
    }

  //   /**
  //    * CompanyList
  //    */
  public FetchUserDetails(): Observable<BaseResponse<UserDetails, string>> {
    let sessionId = (this.generalService.user) ? this.generalService.user?.uniqueName : "";
    let API = '';
    // return this.http.get(this.config.apiUrl + LOGIN_API.FETCH_DETAILS

    return this.http.get(API
      ?.replace(':sessionId', sessionId)).pipe(map((res) => {
        let data: BaseResponse<UserDetails, string> = res;
        data.request = '';
        data.queryString = {};
        return data;
      }), catchError((e) => this.errorHandler.HandleCatch<UserDetails, string>(e, '')));
  }

  // public ClearSession(): Observable<BaseResponse<string, string>> {
  //   let userName = (this.generalService.user) ? this.generalService.user?.uniqueName : "";
  //   return this.http.delete(this.config.apiUrl + LOGIN_API.CLEAR_SESSION?.replace(':userUniqueName', encodeURIComponent(userName))).pipe(map((res) => {
  //     let data: BaseResponse<string, string> = res;
  //     return data;
  //   }), catchError((e) => this.errorHandler.HandleCatch<string, string>(e)));
  // }




  //   public getComapnyUsers(): Observable<BaseResponse<AccountSharedWithResponse[], string>> {
  //       this.companyUniqueName = this.generalService.companyUniqueName;
  //       return this.http.get(this.config.apiUrl + COMPANY_API.GET_COMPANY_USERS?.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName))).pipe(map((res) => {
  //           let data: BaseResponse<AccountSharedWithResponse[], string> = res;
  //           return data;
  //       }), catchError((e) => this.errorHandler.HandleCatch<AccountSharedWithResponse[], string>(e)));
  //   }


  //   /**
  //    * Calls the company uer api
  //    *
  //    * @param {*} model
  //    * @returns {Observable<BaseResponse<any, any>>}
  //    * @memberof CompanyService
  //    */
  //   public getCompanyUser(model: any): Observable<BaseResponse<any, any>> {
  //       let url = this.config.apiUrl + COMPANY_API.GET_COMPANY_USER?.replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))?.replace(':userUniqueName', encodeURIComponent(model.userUniqueName));
  //       return this.http.get(url).pipe(map((res) => {
  //           let data: BaseResponse<any, any> = res;
  //           return data;
  //       }), catchError((e) => this.errorHandler.HandleCatch<string, any>(e, '')));
  //   }


}
