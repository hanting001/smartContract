const crypto = require('crypto');


let pass = '';
var encript = function (text) {
    let ciphers = crypto.getCiphers();
    // console.log(ciphers);
    //--加密
    let AESCipher = crypto.createCipher('aes-256-cbc', process.env.secret);
    let encrypted = AESCipher.update(text, 'utf8', 'hex');
    encrypted += AESCipher.final('hex');
    console.log(encrypted);
    return encrypted;

}
var decrypt = function (encrypted) {
    let AESDecipher = crypto.createDecipher('aes-256-cbc', process.env.secret);
    let decrypted = AESDecipher.update(encrypted, 'hex', 'utf8');
    decrypted += AESDecipher.final('utf8');
    console.log(decrypted);
    return decrypted;
}
exports.encriptPass = function(text) {
    // console.log(process.env.secret);
    pass = encript(text);
}
exports.getPass = () => {
    // console.log(process.env.secret);
    return decrypt(this.pass);
};
exports.init = (pass) => {
    this.pass = pass;
}