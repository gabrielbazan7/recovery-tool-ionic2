import {Page, NavController, NavParams, Alert} from 'ionic-angular';
import {sendFundsService} from '../../services/sendfunds.service';

@Page({
  templateUrl: 'build/pages/transferFunds/transferFunds.html',
  providers: [sendFundsService]
})
export class TransferFunds {
  balance : number;
  scanResults: any;
  wallet : any;
  fee : number;
  net : string;

  constructor(private nav: NavController, navParams: NavParams, private _sendFundsService: sendFundsService) {
    this._sendFundsService = _sendFundsService;
    this.scanResults = navParams.get('scanResults');
    this.balance = this.scanResults.balance;
    this.wallet = navParams.get('wallet');
    this.fee = navParams.get('fee');
    this.net = navParams.get('network');
  }

  sendFunds(address : HTMLInputElement):void {
    console.log(address.value);
    var rawTx;
    try {
      rawTx = this._sendFundsService.createRawTx(address.value, this.scanResults, this.wallet, this.fee);
    } catch (ex) {
      return this.showMessage(ex.message, 3);
    }
    this._sendFundsService.txBroadcast(rawTx, this.net, function(response) {
      console.log(response);
        // showMessage((scanResults.balance - fee).toFixed(8) + ' BTC sent to address: ' + toAddress, 2);
        // console.log('Transaction complete.  ' + (scanResults.balance - fee) + ' BTC sent to address: ' + toAddress);
        // showMessage('Could not broadcast transaction. Please, try later.', 3);
      });
  }

  showMessage(message: string, type: number){
    /*
			1 = status
			2 = success
			3 = error
		*/

    if (type == 1) {
      let alert = Alert.create({
        title: '',
        subTitle: message,
        buttons: ['OK']
      });
      this.nav.present(alert);
    } else if (type == 2) {
      let alert = Alert.create({
        title: 'Success!',
        subTitle: message,
        buttons: ['OK']
      });
      this.nav.present(alert);
    } else if (type == 3) {
      let alert = Alert.create({
        title: 'Error!',
        subTitle: message,
        buttons: ['OK']
      });
      this.nav.present(alert);
    }
    return;
  }
}
