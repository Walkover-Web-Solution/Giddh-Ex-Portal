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
