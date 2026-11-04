const OTP_PROVIDER_SCRIPT_PREFIX = "https://verify.msg91.com/otp-provider.js";

let otpScriptReady: Promise<void> | null = null;

function hasInitSendOtp(): boolean {
  return typeof (window as any)?.initSendOTP === "function";
}

export function ensureOtpProviderScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (hasInitSendOtp()) return Promise.resolve();
  if (otpScriptReady) return otpScriptReady;

  otpScriptReady = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src^="${OTP_PROVIDER_SCRIPT_PREFIX}"]`);

    const onReady = () => {
      if (hasInitSendOtp()) {
        resolve();
        return;
      }
      reject(new Error("OTP widget is not available."));
    };

    if (existingScript) {
      existingScript.addEventListener("load", onReady, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load OTP widget.")), {
        once: true,
      });
      if (hasInitSendOtp()) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `${OTP_PROVIDER_SCRIPT_PREFIX}?time=${Date.now()}`;
    script.async = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error("Unable to load OTP widget."));
    document.body.appendChild(script);
  });

  return otpScriptReady;
}

export interface OtpWidgetSuccessData {
  message: string;
  [key: string]: unknown;
}

export async function openOtpWidget(widgetId: string, tokenAuth: string): Promise<OtpWidgetSuccessData> {
  await ensureOtpProviderScript();

  return new Promise((resolve, reject) => {
    (window as any).initSendOTP({
      widgetId,
      tokenAuth,
      success: (data: OtpWidgetSuccessData) => resolve(data),
      failure: (error: unknown) => {
        reject(error instanceof Error ? error : new Error("OTP verification failed."));
      },
    });
  });
}
