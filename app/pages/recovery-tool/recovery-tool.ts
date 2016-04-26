import {Page, NavController, NavParams, Alert} from 'ionic-angular';
import * as _  from 'lodash';
import {TransferFunds} from '../transferFunds/transferFunds';
import {recoveryService} from '../../services/recovery.service';

@Page({
  templateUrl: 'build/pages/recovery-tool/recovery-tool.html',
  providers: [recoveryService]
})
export class Inputs {
  availableOptions : number[];
  availableNetworks : string[];
  m: string;
  n: string;
  net: string;
  gap: number;
  copayers : number[];
  inputs : any;
  fee: number;

  constructor(private nav: NavController, navParams: NavParams,private _recoveryService: recoveryService) {
    this.m = '1';
    this.n = '1';
    this.net = 'livenet';
    this.gap = 20;
    this.availableOptions = [1,2,3,4,5,6];
    this.availableNetworks = ['livenet','testnet'];
    this.copayers = [1];
    this.inputs = {backup: [],password: [],passwordX: []};
    this._recoveryService = _recoveryService;
    this.fee = 0.0001;
  }

  proccessInputs(): void {
    var self = this;
    var data = _.map(_.range(0, parseInt(this.n)), function(i) {
      return {
        backup: self.inputs.backup[i] || '',
        password: self.inputs.password[i] || '',
        xPrivPass: self.inputs.passwordX[i] || '',
      }
    });

    try {
      var wallet = this._recoveryService.getWallet(data, parseInt(this.m) , parseInt(this.n), this.net);
    } catch (ex) {
      return this.showMessage(ex.message, 3);
    }
    this.showMessage('Scanning funds...', 1);

    var reportFn = function(data){
      console.log('Report:',data);
    }

    var gap = +this.gap;
    gap = gap ? gap : 20;

    this._recoveryService.scanWallet(wallet, gap, reportFn, function(err, res){
      var scanResults = res;
      if (err)
        return this.showMessage(err, 3);

      self.showMessage('Search completed', 2);
      // $("#myModal").modal('hide');
      // $scope.beforeScan = false;
    self.nav.push(TransferFunds, {scanResults: scanResults, wallet: wallet, fee: self.fee, network: self.net});
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

  onChange():void {
    this.copayers = _.map(_.range(1, parseInt(this.n) + 1), function(i) {
      return i;
    });
  }

  changeListener($event, i : number) : void {
    this.readThis($event.target,i);
  }

  readThis(inputValue: any, i: number) : void {
    var self = this;
    var file:File = inputValue.files[0];
    var myReader:FileReader = new FileReader();
    myReader.onloadend = function(e){
      // you can perform an action with readed data here
      self.inputs.backup[i] = myReader.result;
    }

    myReader.readAsText(file);
  }

}
