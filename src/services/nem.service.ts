import nem from 'nem-sdk';
import CryptoJS from 'crypto-js';

const convert = nem.utils.convert;
const CryptoHelpers = nem.crypto.helpers;


export class NemService {
    nemAmount: number;
    nemMessage: string;
    nemAddress: string;
    nemFee: string;
    nemPrivatekey: string;

    transferTransaction: any;
    common: any;

    constructor() {
        // Get an empty un-prepared transfer transaction object
        this.transferTransaction = nem.model.objects.get("transferTransaction");

        // Get an empty common object to hold pass and key
        this.common = nem.model.objects.get("common");
    }

    validateAddress(address) {
        return nem.model.address.isValid(address);
    }

    validateAmount(amount) {
        if (undefined === amount || !nem.utils.helpers.isTextAmountValid(amount)) {
            return false;
        }
        return true;
    }

    updateFee(amount, message) {
        this.nemAmount = amount;
        this.nemMessage = message;

        if (!this.validateAmount(this.nemAmount))
            return false;

        this.transferTransaction.amount = nem.utils.helpers.cleanTextAmount(this.nemAmount);
        this.transferTransaction.message = this.nemMessage;

        var transactionEntity = nem.model.transactions.prepare("transferTransaction")
            (this.common, this.transferTransaction, nem.model.network.data.mainnet.id);

        // Format fee returned in prepared object
        this.nemFee = nem.utils.format.nemValue(transactionEntity.fee)[0] + "." + nem.utils.format.nemValue(transactionEntity.fee)[1];
        return true;
    }


    decryptWalllet(walletinfo, password) {
        return new Promise((resolve, reject) => {
            let salt = CryptoJS.enc.Hex.parse(walletinfo.salt);
            let encrypted = walletinfo.priv_key;

            let key = CryptoJS.PBKDF2(password, salt, {
                keySize: 256 / 32,
                iterations: 2000
            }).toString();

            let iv = encrypted.substring(0, 32);
            let encryptedPrvKey = encrypted.substring(32, 128);

            let obj = {
                ciphertext: CryptoJS.enc.Hex.parse(encryptedPrvKey),
                iv: convert.hex2ua(iv),
                key: convert.hex2ua(key.toString())
            }
            resolve(CryptoHelpers.decrypt(obj));

        })
    }


    signTransaction() {

        // Set the private key in common object
        this.common.privateKey = this.nemPrivatekey;

        // Check private key for errors
        if (this.common.privateKey.length !== 64 && this.common.privateKey.length !== 66)
            return {
                error: true,
                message: 'Invalid private key, length must be 64 or 66 characters !'
            };

        if (!nem.utils.helpers.isHexadecimal(this.common.privateKey))
            return {
                error: true,
                message: 'Private key must be hexadecimal only !'
            }

        // Set the cleaned amount into transfer transaction object
        this.transferTransaction.amount = nem.utils.helpers.cleanTextAmount(this.nemAmount);

        // Recipient address must be clean (no hypens: "-")
        this.transferTransaction.recipient = nem.model.address.clean(this.nemAddress);

        // Set message
        this.transferTransaction.message = this.nemMessage;

        // Prepare the updated transfer transaction object
        var transactionEntity = nem.model.transactions.prepare("transferTransaction")(this.common, this.transferTransaction, nem.model.network.data.mainnet.id);

        // Create a key pair object from private key
        var kp = nem.crypto.keyPair.create(this.common.privateKey);

        // Serialize the transaction
        var serialized = nem.utils.serialization.serializeTransaction(transactionEntity);

        // Sign the serialized transaction with keypair object
        var signature = kp.sign(serialized);

        // Build the object to send
        var result = {
            'data': nem.utils.convert.ua2hex(serialized),
            'signature': signature.toString()
        };

        // Show the object to send in view
        return {
            error: false,
            message: JSON.stringify(result)
        }

    }
}