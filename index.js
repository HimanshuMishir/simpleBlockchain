"use strict";
exports.__esModule = true;
var crypto = require("crypto");
var Transaction = /** @class */ (function () {
    function Transaction(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    Transaction.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return Transaction;
}());
var Block = /** @class */ (function () {
    function Block(prevHash, transaction, ts) {
        if (ts === void 0) { ts = Date.now(); }
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.nonce = Math.round(Math.random() * 999999);
    }
    Object.defineProperty(Block.prototype, "hash", {
        get: function () {
            var str = JSON.stringify(this);
            var hash = crypto.createHash('SHA256');
            hash.update(str).end();
            return hash.digest('hex');
        },
        enumerable: false,
        configurable: true
    });
    return Block;
}());
var Chain = /** @class */ (function () {
    function Chain() {
        this.chain = [new Block(null, new Transaction(100, 'genesis', 'satoshi'))];
    }
    Object.defineProperty(Chain.prototype, "lastBlock", {
        get: function () {
            return this.chain[this.chain.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    Chain.prototype.mine = function (nonce) {
        var solution = 1;
        console.log('⛏️  mining...');
        while (true) {
            var hash = crypto.createHash('MD5');
            hash.update((nonce + solution).toString()).end();
            var attempt = hash.digest('hex');
            if (attempt.substr(0, 4) === '0000') {
                console.log("solved: " + solution);
                return solution;
            }
            solution += 1;
        }
    };
    Chain.prototype.addBlock = function (transaction, senderPublicKey, signature) {
        var verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());
        var isValid = verifier.verify(senderPublicKey, signature);
        if (isValid) {
            var newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    };
    Chain.instance = new Chain();
    return Chain;
}());
var Wallet = /** @class */ (function () {
    function Wallet() {
        var keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    Wallet.prototype.sendMoney = function (amount, payeePublicKey) {
        var transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        var sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();
        var signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    };
    return Wallet;
}());
var satoshi = new Wallet();
var bob = new Wallet();
var alice = new Wallet();
var himanshu = new Wallet();
satoshi.sendMoney(50, bob.publicKey);
bob.sendMoney(23, alice.publicKey);
alice.sendMoney(5, bob.publicKey);
himanshu.sendMoney(11, satoshi.publicKey);
console.log(Chain.instance);
