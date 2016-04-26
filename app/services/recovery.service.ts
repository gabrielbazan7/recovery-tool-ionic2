import * as _  from 'lodash';
import {Injectable} from 'angular2/core';
import { Http, Response, HTTP_PROVIDERS } from 'angular2/http';
import 'es6-shim';
import { Component } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl } from 'angular2/common';
import { bootstrap } from 'angular2/platform/browser';

import 'rxjs/add/operator/map';


declare var sjcl: any;
// declare var Mnemonic: any;

@Injectable()
export class recoveryService {
    Mnemonic : any;
    PATHS : any;
    bitcore : any;

    constructor(public http: Http){
      this.bitcore = require('bitcore');
      this.PATHS = {
        'BIP45': ["m/45'/2147483647/0/", "m/45'/2147483647/1/"],
        'BIP44': {
          'testnet': ["m/44'/1'/0'/0/", "m/44'/1'/0'/1/"],
          'livenet': ["m/44'/0'/0'/0/", "m/44'/0'/0'/1/"]
        },
      }
      // var Mnemonic = require('bitcore-mnemonic');
      // var code = new Mnemonic(Mnemonic.Words.SPANISH);
      // console.log(code.toString());
      // console.log(bitcore.Address.isValid('126vMmY1fyznpZiFTTnty3cm1Rw8wuheev'));
    }

    fromBackup(data: any, m: number, n: number , network: string) {
      if (!data.backup)
        return null;
      try {
        JSON.parse(data.backup);
      } catch (ex) {
        throw new Error("Your JSON is not valid, please copy only the text within (and including) the { } brackets around it.");
      };
      var payload;
      try {
        payload = sjcl.decrypt(data.password, data.backup);
      } catch (ex) {
        throw new Error("Incorrect backup password");
      };
      payload = JSON.parse(payload);
      if ((payload.m != m) || (payload.n != n)) {
        throw new Error("The wallet configuration (m-n) does not match with values provided.");
      }
      if (payload.network != network) {
        throw new Error("Incorrect network.");
      }
      if (!(payload.xPrivKeyEncrypted) && !(payload.xPrivKey)) {
        throw new Error("The backup does not have a private key");
      }
      var xPriv = payload.xPrivKey;
      if (payload.xPrivKeyEncrypted) {
        try {
          xPriv = sjcl.decrypt(data.passwordX, payload.xPrivKeyEncrypted);
        } catch (ex) {
          throw new Error("Can not decrypt private key");
        }
      }
      var credential = {
        walletId: payload.walletId,
        copayerId: payload.copayerId,
        xPriv: xPriv,
        derivationStrategy: payload.derivationStrategy || "BIP45",
        addressType: payload.addressType || "P2SH",
        m: m,
        n: n,
        network: network,
        from: "backup",
      };
      return credential;
    }

    fromMnemonic(data, m, n, network) {
      if (!data.backup)
        return null;

      var words = data.backup;
      var passphrase = data.password;
      var xPriv;

      try {
        xPriv = new this.Mnemonic(words).toHDPrivateKey(passphrase, network).toString();
      } catch (ex) {
        throw new Error("Mnemonic wallet seed is not valid.");
      };

      var credential = {
        xPriv: xPriv,
        derivationStrategy: "BIP44",
        addressType: n == 1 ? "P2PKH" : "P2SH",
        m: m,
        n: n,
        network: network,
        from: "mnemonic",
      };
      return credential;
    }

    buildWallet(credentials : any) {
    credentials = _.compact(credentials);
    if (credentials.length == 0)
      throw new Error('No data provided');

    if (_.uniq(_.map(credentials, 'from')).length != 1)
      throw new Error('Mixed backup sources not supported');

    var result = _.pick(credentials[0], ["walletId", "derivationStrategy", "addressType", "m", "n", "network", "from"]);

    result['copayers'] = _.map(credentials, function(c) {
      if (c['walletId'] != result['walletId'])
        throw new Error("Backups do not belong to the same wallets.");
      return {
        copayerId: c['copayerId'],
        xPriv: c['xPriv'],
      };
    });
    if (result['from'] == "backup") {
      if (_.uniq(_.compact(_.map(result['copayers'], 'copayerId'))).length != result['copayers'].length)
        throw new Error("Some of the backups belong to the same copayers");
    }
    return result;
  }

  getWallet(data : any, m: number, n: number, network: string): any{
    var self = this;
    var credentials = _.map(data, function(dataItem) {
      if (dataItem['backup'].charAt(0) == '{')
        return self.fromBackup(dataItem, m, n, network);
      else
        return self.fromMnemonic(dataItem, m, n, network);
    });
    return this.buildWallet(credentials);
  }

  scanWallet(wallet: any, inGap: number, reportFn: any, cb): any{
    reportFn("Getting addresses... GAP:" + inGap);

    // getting main addresses
    this.getActiveAddresses(wallet, inGap, reportFn, function(err, addresses) {
      reportFn("Active addresses:" + JSON.stringify(addresses));
      if (err) return cb(err);
      var utxos = _.map(_.flatten(_.map(addresses, "utxo")),"amount");
      var result = {
        addresses: addresses,
        balance: _.sum(utxos),
      }
      return cb(null, result);
    });
  }

  getPaths(wallet: any) {
    if (wallet.derivationStrategy == 'BIP45')
      return this.PATHS[wallet.derivationStrategy];
    if (wallet.derivationStrategy == 'BIP44')
      return this.PATHS[wallet.derivationStrategy][wallet.network];
  }

    getActiveAddresses(wallet: any, inGap: number, reportFn: any, cb) {
      var self = this;
      var activeAddress = [];
      var paths = this.getPaths(wallet);
      var inactiveCount;

      function explorePath(i) {
        if (i >= paths.length) return cb(null, activeAddress);
        inactiveCount = 0;
        derive(paths[i], 0, function(err, addresses) {
          if (err) return cb(err);
          explorePath(i + 1);
        });
      }

      function derive(basePath, index, cb) {
        if (inactiveCount > inGap) return cb();
        var address = self.generateAddress(wallet, basePath, index);
        reportFn('Exploring Address:' + JSON.stringify(address));
        self.getAddressData(address, wallet.network, function(err, addressData) {
          if (err) return cb(err);

          if (!_.isEmpty(addressData)) {
            reportFn('Address is Active!');
            activeAddress.push(addressData);
            inactiveCount = 0;
          } else
            inactiveCount++;

          reportFn('inactiveCount:' + inactiveCount);

          derive(basePath, index + 1, cb);
        });
      }
      explorePath(0);
    }

    generateAddress(wallet: any, path: any, index: number) {
      var self = this;
      var derivedPublicKeys = [];
      var derivedPrivateKeys = [];

      var xPrivKeys = _.map(wallet.copayers, 'xPriv');

      _.each(xPrivKeys, function(xpk) {
        var hdPrivateKey = self.bitcore.HDPrivateKey(xpk);

        // private key derivation
        var derivedHdPrivateKey = hdPrivateKey.derive(path + index);
        var derivedPrivateKey = derivedHdPrivateKey.privateKey;
        derivedPrivateKeys.push(derivedPrivateKey);

        // public key derivation
        var derivedHdPublicKey = derivedHdPrivateKey.hdPublicKey;
        var derivedPublicKey = derivedHdPublicKey.publicKey;
        derivedPublicKeys.push(derivedPublicKey);
      });
      var address;
      if (wallet.addressType == "P2SH")
        address = self.bitcore.Address.createMultisig(derivedPublicKeys, wallet.m, wallet.network);
      else if (wallet.addressType == "P2PKH")
        address = self.bitcore.Address.fromPublicKey(derivedPublicKeys[0], wallet.network);
      else
        throw new Error('Address type not supported');
      return {
        addressObject: address,
        pubKeys: derivedPublicKeys,
        privKeys: derivedPrivateKeys,
        path: path + index
      };
    }

    getAddressData(address: any, network: string, cb) {
      var self = this;
      // call insight API to get address information
      self.checkAddress(address['addressObject'], network, function(respAddress) {
        // call insight API to get utxo information
        self.checkUtxos(address['addressObject'], network, function(respUtxo) {

          var addressData = {};
          console.log(respAddress);
          if (respAddress['unconfirmedTxApperances'] + respAddress['txApperances'] > 0) {
            addressData = {
              address: respAddress['addrStr'],
              balance: respAddress['balance'],
              unconfirmedBalance: respAddress['unconfirmedBalance'],
              utxo: respUtxo,
              privKeys: address['privKeys'],
              pubKeys: address['pubKeys'],
              path: address['path']
            };
          }
          // $rootScope.$emit('progress', addressData);
          return cb(null, addressData);
        });
      });
    }

    checkAddress(address: string, network: string, cb) {
      if (network == 'testnet'){
        this.http.get('https://test-insight.bitpay.com/api/addr/' + address + '?noTxList=1').map(res => res.json()).subscribe(data => {
          return cb(data)
        });
      }
      else
        this.http.get('https://insight.bitpay.com/api/addr/' + address + '?noTxList=1').map(res => res.json()).subscribe(data => {
          return cb(data)
        });
    }

    checkUtxos(address: string, network: string, cb) {
      if (network == 'testnet'){
        this.http.get('https://test-insight.bitpay.com/api/addr/' + address + '/utxo?noCache=1').map(res => res.json()).subscribe(data => {
          return cb(data)
        });
      }
      else
        this.http.get('https://insight.bitpay.com/api/addr/' + address + '/utxo?noCache=1').map(res => res.json()).subscribe(data => {
          return cb(data)
        });
    }

}
