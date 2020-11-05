export function objectToBase64(obj: any) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}
