const EMAIL_REGX: RegExp =
/^[a-zA-Z0-9._+]+(\.[a-zA-Z0-9._+]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[A-Za-z]{2,}$/;

const PASSWORD_REGX: RegExp =
/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const OTP_REGX: RegExp = /^\d*$/;

const PASSWORD_REGEX_NOT_SPECIAL_CHAR: RegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,32}$/;
const VALID_NAME_REGEX: RegExp = /^[\p{L}\p{N}\s\u3040-\u30FF\u4E00-\u9FFF!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]*$/u;


const DATE_OF_BIRTH_REGX: RegExp = /^(19|20)\d{2}\/(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])$/;

export { DATE_OF_BIRTH_REGX, EMAIL_REGX, OTP_REGX, PASSWORD_REGEX_NOT_SPECIAL_CHAR, PASSWORD_REGX, VALID_NAME_REGEX };
