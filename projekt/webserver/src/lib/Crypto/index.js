/*global Buffer*/
//modules:
import fs from 'fs';
//utilities:
import global from './Global';
// methods:
import generateSalt from './generateSalt';
import generateSecret from './generateSecret';
import getHash from './getHash';
import initialize from './initialize';
import loadSecretFromFile from './loadSecretFromFile';
import saveSecretToFile from './saveSecretToFile';
import setBestAvailableCipher from './setBestAvailableCipher';
import setBestAvailableHashAlgorithm from './setBestAvailableHashAlgorithm';
import slowEquals from './slowEquals';
import validate from './validate';

export default class Crypto{
  constructor(file) {
    this.crypto = global.crypto;

    this.goodCiphers = ['aes-256-cbc-hmac-sha1', 'aes-256-cbc'];
    this.availableCiphers = this.crypto.getCiphers();
    this.CIPHER = global.CIPHER;

    this.goodHashAlgoritms = ['sha512WithRSAEncryption', 'rsa-sha512', 'sha512', 'sha256WithRSAEncryption', 'rsa-sha256', 'sha256'];
    this.availableHashAlgorithms = this.crypto.getHashes();
    this.HASH_ALGORITHM = global.HASH_ALGORITHM;

    this.secret = undefined;
    this.file = file;

    /**
     * class methods
     */

    this.generateSalt = generateSalt;
    this.generateSecret = generateSecret;
    this.getHash = getHash;
    this.initialize = initialize;
    this.loadSecretFromFile = loadSecretFromFile;
    this.saveSecretToFile = saveSecretToFile;
    this.setBestAvailableCipher = setBestAvailableCipher;
    this.setBestAvailableHashAlgorithm = setBestAvailableHashAlgorithm;
    this.slowEquals = slowEquals;
    this.validate = validate;
  }
}
