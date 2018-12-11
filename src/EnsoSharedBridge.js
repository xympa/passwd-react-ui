export const networkEncode = data => (data == null ? netUrlEncode(btoa("")) : netUrlEncode(btoa(data)))

export const networkDecode = data => atob(netUrlDecode(data))

/**
 * Funcção que substitui os caracteres que não podem ser tranmitidos no url
 * e que fazem parte do dicionario do Base64
 * 
 * @param String na qual será feito o UrlEncode
 * @return string com o resultado do UrlEncode
 */
const netUrlEncode = data => {
    const find = '\\+';
    const re = new RegExp(find, 'g');
    data = data.replace(re, '-');

    const find2 = '/';
    const re2 = new RegExp(find2, 'g');
    data = data.replace(re2, '_');

    const find3 = '=';
    const re3 = new RegExp(find3, 'g');
    data = data.replace(re3, ':');

    return data;
}

/**
 * Funcção que repõe os caracteres que não podem ser tranmitidos no url
 * e que fazem parte do dicionario do Base64
 * 
 * @param string na qual será feito o UrlDecode
 * @return string com o resultado do UrlDecode
 */
const netUrlDecode = data => {
    const find = '-';
    const re = new RegExp(find, 'g');
    data = data.replace(re, '+');

    const find2 = '_';
    const re2 = new RegExp(find2, 'g');
    data = data.replace(re2, '/');

    const find3 = ':';
    const re3 = new RegExp(find3, 'g');
    data = data.replace(re3, '=');

    return data;
}