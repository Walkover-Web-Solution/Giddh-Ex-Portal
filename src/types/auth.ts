export interface Account {
  account: {
    name: string;
    uniqueName: string;
  };
  vendorContactUniqueName: string;
  email?: string;
  companyUniqueName?: string;
  session?: {
    id: string;
  };
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
