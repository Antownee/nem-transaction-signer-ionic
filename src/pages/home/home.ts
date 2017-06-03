import { Component } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { NemService } from "../../services/nem.service";
import { ModalContentPage } from "./modal";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  addressvalid: boolean;
  amountValid: boolean;
  nemAmount: number;
  nemMessage: string;
  nemAddress: string;
  nemPrivatekey: string;
  nemFee = "0";
  btnDisabled: boolean;


  constructor(
    public navCtrl: NavController,
    private nemService: NemService,
    private modalCtrl: ModalController,
    public alrtCtrl: AlertController) {
    this.addressvalid = false;
    this.amountValid = false;


    // this.nemAddress = "TBDTYHTPESJTFSDQVTDX2M2BVH25FC5FDMBR4GO4";
    // this.nemPrivatekey = "4bd82a4ab78308b2045b920f2d87756e95960e606bc2898d53f805ba30185fca";
  }

  validateAddress(address) {
    this.addressvalid = this.nemService.validateAddress(address);
    if (this.addressvalid) {
      this.nemAddress = this.nemService.nemAddress = address;
      return;
    };
    this.nemAddress = "";
  }

  updateFee() {
    let res = this.nemService.updateFee(this.nemAmount, this.nemMessage || "")
    if (res) {
      this.nemFee = this.nemService.nemFee;
      this.amountValid = res;
    } else {
      //Error alert for invalid amount
    }
  }

  updateAmount(amount) {
    this.nemAmount = amount;
    this.updateFee();
  }

  updateMessage(message) {
    this.nemMessage = message;
    this.updateFee();
  }

  updatePrvKey(prvKey) {
    this.nemService.nemPrivatekey = prvKey;
    console.log(prvKey)
  }


  openModal() {
    //Before signing, check private key field has something
    let f = document.getElementById('prvKey').getElementsByTagName('input')[0].value;
    console.log(f);
    if (f == undefined || f.length == 0) {
      //Alert to enter private key
      return this.showAlert('Warning', 'Enter your private key.')
    }

    let res = this.nemService.signTransaction();

    if (res.error) {
      return this.showAlert('Error', res.message);
    }

    this.modalCtrl.create(ModalContentPage, { qrData: res.message }).present();
  }



  showAlert(title, message) {
    this.alrtCtrl.create({
      title: title,
      message: message,
      buttons: ['Ok']
    }).present();
  }

}
