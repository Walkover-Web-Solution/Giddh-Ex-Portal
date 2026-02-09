export enum ApiResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export interface VerifyPortalUserResponse {
  status: ApiResponseStatus;
  body: Array<{
    email: string;
    account: {
      name: string;
      uniqueName: string;
    };
    vendorContactUniqueName: string;
    companyUniqueName: string;
    session?: {
      id: string;
    };
  }>;
}
