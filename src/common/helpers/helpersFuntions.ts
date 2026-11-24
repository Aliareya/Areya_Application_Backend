export function generateSupplierCode(): string {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `SUP-SHOP${randomNumber}`;
}
