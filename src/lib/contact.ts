/** Sahay SMS short code */
export const SAHAY_SMS_NUMBER = "96840";

/** Toll-free helpline */
export const SAHAY_TOLL_FREE = "18002503202";

export const SAHAY_TOLL_FREE_DISPLAY = "1800 250 3202";

export const smsUri = (body?: string) =>
  body ? `sms:${SAHAY_SMS_NUMBER}?body=${encodeURIComponent(body)}` : `sms:${SAHAY_SMS_NUMBER}`;

export const tollFreeUri = `tel:${SAHAY_TOLL_FREE}`;
