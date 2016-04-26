import * as _  from 'lodash';
import {Injectable} from 'angular2/core';
import { Http, Response, HTTP_PROVIDERS, Headers} from 'angular2/http';

import 'rxjs/add/operator/map';

@Injectable()
export class sendFundsService {
    bitcore : any;

    constructor(public http: Http){
      this.bitcore = require('bitcore');
    }


    createRawTx(toAddress: string, scanResults: any, wallet: any, fee: number) {
      if (!toAddress || !this.bitcore.Address.isValid(toAddress))
        throw new Error('Please enter a valid address.');

      var amount = parseInt((scanResults.balance * 1e8 - fee * 1e8).toFixed(0));

      if (amount <= 0)
        throw new Error('Funds are insufficient to complete the transaction');

      try {
        new this.bitcore.Address(toAddress, wallet.network);
      } catch (ex) {
        throw new Error('Incorrect destination address network');
      }

      try {
        var privKeys = [];
        var tx = new this.bitcore.Transaction();
        _.each(scanResults.addresses, function(address) {
          if (address.utxo.length > 0) {
            _.each(address.utxo, function(u) {
              if (wallet.addressType == 'P2SH')
                tx.from(u, address.pubKeys, wallet.m);
              else
                tx.from(u);
              privKeys = privKeys.concat(address.privKeys);

            });
          }
        });
        tx.to(toAddress, amount);
        tx.sign(_.uniq(privKeys));

        var rawTx = tx.serialize();
        console.log("Raw transaction: ", rawTx);
        return rawTx;
      } catch (ex) {
        console.log(ex);
        throw new Error('Could not build tx ' + ex);
      }
    }

    txBroadcast(rawTx: string, network: string, cb) {
      console.log(JSON.stringify({rawtx: rawTx}));
      console.log(network);
      var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      if (network == 'testnet')
        this.http.post('https://test-insight.bitpay.com/api/tx/send', JSON.stringify({rawtx: rawTx}), {headers: headers}).map(res => res.json()).subscribe(data => {return cb(data);});
      else
        this.http.post('https://insight.bitpay.com/api/tx/send', JSON.stringify({rawtx: rawTx})).map(res => res.json()).subscribe(data => {return cb(data);});

    }
}
