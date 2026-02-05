export interface Account {
  account: {
    name: string;
    uniqueName: string;
  };
  vendorContactUniqueName: string;
}

export interface UserData {
  email: string;
  account: Account["account"];
  vendorContactUniqueName: string;
}

export interface SessionData {
  companyUniqueName: string;
  sessionId: string;
}
