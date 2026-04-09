export function getAuthRedirectPath(country: string): string {
  return country === "uk" ? "/auth/uk" : "/auth/in";
}
