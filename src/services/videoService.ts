export function generateVideoLink(appointmentId: string, requestUrl: string) {
  return new URL(`/visit/${appointmentId}`, requestUrl).toString();
}
