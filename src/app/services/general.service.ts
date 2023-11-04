import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { GiddhErrorHandler } from './catch-manager/catchmanger';
import { UserDetails } from "../models/loginModels";
import { catchError, map } from "rxjs/operators";
import { API } from "./apiurls/auth.api";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";

@Injectable()
export class GeneralService {


    private companyUniqueName: string;

  constructor(private errorHandler: GiddhErrorHandler, private http: HttpWrapperService  ) {
  }





}
