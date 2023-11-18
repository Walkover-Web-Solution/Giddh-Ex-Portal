export interface ReciptResponse {
    items: ReceiptItem[];
    page: number;
    count: number;
    totalPages: number;
    totalItems: number;
}

export interface ReceiptItem {
    dueDays: number;
    voucherNumber: string;
    account: ReceiptAccount;
    uniqueName: string;
    balanceStatus: string;
    voucherDate: string;
    grandTotal: AmountClassMulticurrency;
    balanceDue: AmountClassMulticurrency;
    dueDate: string;
    isSelected?: boolean;
    cashInvoice: boolean;
    accountCurrencySymbol?: string;
    invoiceLinkingRequest?: IInvoiceLinkingRequest;
    totalBalance?: AmountClassMulticurrency;
    purchaseOrderNumbers?: number;
    grandTotalTooltipText?: string;
    balanceDueTooltipText?: string;
    status?: string;
    errorMessage?: string;
    eInvoiceStatusTooltip?: string;
    gainLoss?: number;
    exchangeRate?: number;
    referenceVoucher?: ReferenceVoucher;
    adjustments?: any;
}
export interface ReceiptAccount {
    uniqueName: string;
    accountType?: any;
    name: string;
    currency?: CurrencyClass;
    customerName?: string;
}
export class AmountClassMulticurrency {
    public amountForAccount: number;
    public amountForCompany: number;
    public type?: string;
    public accountUniqueName?: string;

    constructor() {
        this.type = 'DEBIT';
    }
}
export class IInvoiceLinkingRequest {
    public linkedInvoices: ILinkedInvoice[];
}
export class ILinkedInvoice {
    public invoiceUniqueName: string;
    public invoiceNumber?: string;
    public voucherType: string;
}
export class ReferenceVoucher {
    public uniqueName: string;
    public number?: any;
    public voucherType?: string;
    public date?: string;
}
class CurrencyClass {
    public code: string;
    public symbol?: string;
}
export interface ActiveFinancialYear {
    financialYearStarts: string;
    financialYearEnds: string;
    isLocked: boolean;
    uniqueName: string;
}
export class CountryResponse {
    alpha2CountryCode: string;
    alpha3CountryCode: string;
    callingCode: string;
    countryName: string;
    currency: {
        code: string;
        symbol: string;
    };
}
export interface ICommonItem extends INameUniqueName {
    email: string;
    mobileNo: string;
}
export interface INameUniqueName {
    email?: any;
    uniqueName: string;
    name: string;
    isActive?: boolean;
    customerName?: string;
    parentGroups?: any;
    category?: any;
}
export class CompanyResponse {
    public canUserSwitch: boolean;
    public companyIdentity: any[];
    public activeFinancialYear: ActiveFinancialYear;
    public email: string;
    public city: string;
    public pincode: string;
    public country: string;
    public countryV2: CountryResponse;
    public updatedAt: string;
    public updatedBy: ICommonItem;
    public createdAt: string;
    public createdBy: ICommonItem;
    public uniqueName: string;
    public baseCurrency: string;
    public contactNo: string;
    public companySubscription: CompanySubscription;
    public financialYears: ActiveFinancialYear[];
    public sharedEntity?: any;
    public address: string;
    public state: string;
    public shared: boolean;
    public alias?: any;
    public role: Role;
    public name: string;
    public addresses: Addresses[];
    public panNumber?: string;
    public isMultipleCurrency?: boolean;
    public userEntityRoles?: UserEntityRole[];
    public nameAlias?: string;
    public balanceDisplayFormat?: string;
    public balanceDecimalPlaces?: string;
    public baseCurrencySymbol?: string;
    public companyTotals: CompanyTotals;
    public branches?: Array<any>;
    public parentBranch?: ParentBranch;
    public warehouseResource?: Array<any>;
    public showOnSubscription?: boolean;
}
export interface ParentBranch {
    addresses: Addresses[];
    alias: string;
    businessNature: string;
    businessType: string;
    name: string;
    parentBranch: ParentBranch;
    parentBranchUniqueName: string;
    uniqueName: string;
}
export class CompanyTotals {
    public sales: {
        amount: any;
        type: any;
    };
    public expenses: {
        amount: any;
        type: any;
    };
    public taxes: {
        amount: any;
        type: any;
    };
}
export interface UserEntityRole {
    sharedWith: ICommonItem;
    uniqueName: string;
    allowedCidrs: any[];
    allowedIps: any[];
    period?: any;
    from?: any;
    to?: any;
    sharedBy: ICommonItem;
    duration?: any;
    entity: IEntityItem;
    role: Role;
}
interface IEntityItem extends ICommonItem {
    entity: string;
}
export class Addresses {
    public stateCode: string;
    public address: string;
    public isDefault: boolean;
    public stateName: string;
    public taxNumber: string;
    public name?: string;
    public taxType?: string;
    public pincode?: string;
    public county?: { code: string; name?: string };
}
export interface Role {
    uniqueName: string;
    name: string;
    scopes?: any[];
}
export interface ServicePlan {
    planName: string;
    servicePeriod: number;
    amount: number;
}
export interface CompanySubscription {
    discount: number;
    subscriptionDate: string;
    nextBillDate: string;
    autoDeduct: boolean;
    paymentMode: string;
    servicePlan: ServicePlan;
    paymentDue: boolean;
    remainingPeriod: number;
    primaryBillerConfirmed: boolean;
    billAmount: number;
    primaryBiller?: any;
    createdAt: string;
    createdBy: ICommonItem;
}
