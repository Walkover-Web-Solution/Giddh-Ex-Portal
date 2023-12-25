import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackBarComponent } from "../shared/snackbar/snackbar.component";
import { Router } from "@angular/router";
declare var initVerification: any;

@Injectable()
export class GeneralService {
    /** True if script is loaded */
    public scriptLoaded: boolean = false;

    constructor(
        private snackBar: MatSnackBar,
        private router: Router
    ) {
        
    }

    /**
     * This will be use for show snackbar
     *
     * @param {string} message
     * @return {*}
     * @memberof GeneralService
     */
    public showSnackbar(message: string, type: string = "error"): void {
        this.snackBar.openFromComponent(SnackBarComponent, {
            data: { message: message },
            horizontalPosition: "center",
            verticalPosition: "top",
            panelClass: type
        });
    }

    /**
     * This will be use for converting base64 to blob format
     *
     * @param {*} b64Data
     * @param {*} contentType
     * @param {*} sliceSize
     * @return {*}
     * @memberof GeneralService
     */
    public base64ToBlob(b64Data: any, contentType: any, sliceSize: any): Blob {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        let byteCharacters = atob(b64Data);
        let byteArrays = [];
        let offset = 0;
        if (byteCharacters && byteCharacters.length > 0) {
            while (offset < byteCharacters?.length) {
                let slice = byteCharacters.slice(offset, offset + sliceSize);
                let byteNumbers = new Array(slice?.length);
                let i = 0;
                while (i < slice?.length) {
                    byteNumbers[i] = slice.charCodeAt(i);
                    i++;
                }
                let byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
                offset += sliceSize;
            }
        }
        return new Blob(byteArrays, { type: contentType });
    }

    /**
     * Returns the string initials upto 2 letters/characters
     *
     * @param {string} name String whose intials are required
     * @param {string} [delimiter] Delimiter to break the strings
     * @return {*} {string} Initials of string
     * @memberof GeneralService
     */
    public getInitialsFromString(name: string, delimiter?: string): string {
        if (name) {
            let nameArray = name.split(delimiter || " ");
            if (nameArray?.length > 1) {
                // Check if "" is not present at 0th and 1st index
                let count = 0;
                let initials = '';
                nameArray.forEach(word => {
                    if (word && count < 2) {
                        initials += ` ${word[0]}`;
                        count++;
                    }
                })
                return initials;
            } else if (nameArray?.length === 1) {
                return nameArray[0][0];
            }
        }
        return '';
    }

    /**
     * This will be use for load script for proxy login button
     *
     * @param {*} id
     * @param {*} configuration
     * @return {*}  {Promise<void>}
     * @memberof GeneralService
     */
    public loadScript(id: any, configuration: any): Promise<void> {
        const scriptSrc = 'https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js';
        return new Promise((resolve, reject) => {
            if (!this.scriptLoaded) {
                const script = document.createElement('script');
                script.src = scriptSrc;
                script.type = 'text/javascript';
                script.defer = true;
                script.onload = () => {
                    this.scriptLoaded = true;
                    initVerification(configuration);
                    resolve();
                };
                script.onerror = (error) => {
                    reject(error);
                };
                document.getElementById(id)?.append(script);
            } else {
                initVerification(configuration);
                resolve();
            }
        });
    }

    /**
     * Returns folder name
     *
     * @returns {string}
     * @memberof GeneralService
     */
    public getStoreFolderName(): string {
        let url = this.router.url?.split("/");
        return url?.length > 1 ? url[1] : "";
    }
}
