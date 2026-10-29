const GOOGLE_SDK_URL = "https://accounts.google.com/gsi/client";

let googleSdkReady: Promise<void> | null = null;

function hasGoogleOauth(): boolean {
  return Boolean((window as any)?.google?.accounts?.oauth2);
}

export function ensureGoogleSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (hasGoogleOauth()) return Promise.resolve();
  if (googleSdkReady) return googleSdkReady;

  googleSdkReady = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_SDK_URL}"]`);

    const onReady = () => {
      if (hasGoogleOauth()) {
        resolve();
        return;
      }
      reject(new Error("Google SDK is not available."));
    };

    if (existingScript) {
      existingScript.addEventListener("load", onReady, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Google SDK.")), {
        once: true,
      });
      if (hasGoogleOauth()) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SDK_URL;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error("Unable to load Google SDK."));
    document.head.appendChild(script);
  });

  return googleSdkReady;
}

export function requestGoogleAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const googleWindow = (window as any).google;
    if (!googleWindow?.accounts?.oauth2) {
      reject(new Error("Google login script is not available yet. Please try again."));
      return;
    }

    const client = googleWindow.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error_description || "Google login failed."));
          return;
        }
        resolve(response.access_token as string);
      },
    });

    client.requestAccessToken();
  });
}

export async function getGoogleUserEmail(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;

    const data: any = await response.json();
    return data?.email || null;
  } catch {
    return null;
  }
}
