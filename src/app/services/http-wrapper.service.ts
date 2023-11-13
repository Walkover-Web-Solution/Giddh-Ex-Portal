import { finalize, tap } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class HttpWrapperService {
    constructor(
        private http: HttpClient
    ) {

    }

    public get = (
        url: string,
        params?: any,
        options?: any
    ): Observable<any> => {
        options = this.prepareOptions(options);
        options.params = params;
        return this.http.get(url, options).pipe(
            tap(res => {
                //
            }),
            finalize(() => {

            })
        );
    };
    public post = (url: string, body: any, options?: any): Observable<any> => {
      options = this.prepareOptions(options);
        return this.http.post(url, body, options).pipe(
            tap(res => {
                //
            }),
            finalize(() => {

            })
        );
    };
    public put = (url: string, body: any, options?: any): Observable<any> => {
        options = this.prepareOptions(options);
        return this.http.put(url, body, options).pipe(
            tap(res => {
                //
            }),
            finalize(() => {

            })
        );
    };
    public delete = (
        url: string,
        params?: any,
        options?: any
    ): Observable<any> => {
        options = this.prepareOptions(options);
        options.search = this.objectToParams(params);
        return this.http.delete(url, options).pipe(
            tap(res => {
                //
            }),
            finalize(() => {

            })
        );
    };

    public deleteWithBody = (url: string, request: any): Observable<any> => {
        let options: any = { headers: {}, body: {} };
        options.headers["Content-Type"] = "application/json";
        options.headers["Accept"] = "application/json";
        options.headers = new HttpHeaders(options.headers);
        options.body = request;
        return this.http.delete(url, options).pipe(
            tap(res => {
                //
            }),
            finalize(() => {

            })
        );
    };

  public portalLogin = (url: string, proxy_auth_token: any): Observable<any> => {
    let options: any = { headers: {}, body: {} };
    options.headers["Content-Type"] = "application/json";
    options.headers["Accept"] = "application/json";
    options.headers["proxy_auth_token"] = proxy_auth_token;
    options.headers = new HttpHeaders(options.headers);
    return this.http.get(url, options).pipe(
      tap(res => {
        //
      }),
      finalize(() => {

      })
    );
  };


  public verifyPortal = (url: string, emailId: string, proxy_auth_token: any, domain: any): Observable<any> => {
    const existingHeaders = new HttpHeaders();
    const dataObj = {
      emailId: emailId,
      subDomain: domain
    };
    const headers = existingHeaders.append('proxy_auth_token', proxy_auth_token)
    const options = { headers: headers };

    return this.http.post(url, dataObj, options).pipe(
      tap(res => {
        console.log(res);

      }),
      finalize(() => {
        // Perform any finalization tasks
      })
    );
  };

    public patch = (url: string, body: any, options?: any): Observable<any> => {
        options = this.prepareOptions(options);
        return this.http.patch(url, body, options).pipe(
            tap(res => {
                //
            }),
            finalize(() => {

            })
        );
    };

    public prepareOptions(options: any): any {
        if (options && options.loader) {
            if (options.loader !== "hide") {

            }
        } else {

        }
        options = options || {};

        if (!options.headers) {
            options.headers = {} as any;
        }

        options.headers["cache-control"] = "no-cache";
        if (!options.headers["Content-Type"]) {
            options.headers["Content-Type"] = "application/json";
        }
        if (options.headers["Content-Type"] === "multipart/form-data") {
            delete options.headers["Content-Type"];
        }
        if (!options.headers["Accept"] && options.headers["Content-Type"] != "application/x-www-form-urlencoded") {
            options.headers["Accept"] = "application/json";
        }
        if (options.headers["Content-Type"] == "application/x-www-form-urlencoded") {
            delete options.headers["cache-control"];
            delete options.headers["Session-Id"];
        }

        options.headers = new HttpHeaders(options.headers);
        return options;
    }

    public isPrimitive(value: any) {
        return (
            value == null ||
            (typeof value !== "function" && typeof value !== "object")
        );
    }

    public objectToParams(object: any = {}) {
        return Object.keys(object)
            .map(value => {
                let objectValue = this.isPrimitive(object[value])
                    ? object[value]
                    : JSON.stringify(object[value]);
                return `${value}=${objectValue}`;
            })
            .join("&");
    }
}
