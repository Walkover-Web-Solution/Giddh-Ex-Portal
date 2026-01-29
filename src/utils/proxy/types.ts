export enum VerifyPortalUserStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export interface VerifyPortalUserResponse {
  status: VerifyPortalUserStatus;
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
