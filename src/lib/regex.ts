export const Regex = {
  GST: /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/i,
  AADHAAR: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
  PAN: /^(?:[A-Z]{5}[0-9]{4}[A-Z])?$/i,
  PHONE_NUMBER: /^\d{10}$/,
  DIGITS: /^[0-9]+$/,
  IFSC: /^[A-Za-z]{4}0[A-Z0-9a-z]{6}$/i,
}
