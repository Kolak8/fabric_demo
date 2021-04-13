export function makeImageBlobFromBuffer(imageBuffer, type = 'image/jpeg') {
  return new Blob([imageBuffer], { type });
}
