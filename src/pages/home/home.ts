import { Component } from '@angular/core';
import { NavController, AlertController, ModalController,NavParams  } from 'ionic-angular';
import { NemService } from "../../services/nem.service";
import { ModalContentPage } from "./modal";
import { BarcodeScanner } from '@ionic-native/barcode-scanner'


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
    public alrtCtrl: AlertController,
    private barcodeScnr: BarcodeScanner,
    public navParams: NavParams) {

      this.nemPrivatekey = this.navParams.get('prvKey');
      this.updatePrvKey(this.nemPrivatekey);
    
    //this.devfn();

  }

  devfn() {
    this.addressvalid = false;
    this.amountValid = false;

    // this.nemAddress = "TCOOUX72R5C3XK5NK2NQOIQOUZFYA6I5CSZ7HKDP";
    this.nemPrivatekey = "d62cc1d91267734f2a9c583cab70b0c922a110188a9243a12e8b9c7d5bf85d4c";
    this.updatePrvKey(this.nemPrivatekey);
  }

  scan() {
    console.log('open');
    this.barcodeScnr.scan()
      .then((bd) => {
        if (bd.format !== "QR_CODE") {
          return this.showAlert('Error', "Invalid QR code");
        }

        let info = JSON.parse(bd.text).data;

        //validate address
        this.nemAddress = info.addr;
        this.validateAddress(this.nemAddress);

        this.nemAmount = parseInt(info.amount) / 1000000;
        this.nemMessage = info.msg
        this.updateFee();

      })
      .catch((err) => {
        console.log(err)
        return this.showAlert('Error', err.message);
      })
  }

  validateAddress(address) {
    this.addressvalid = this.nemService.validateAddress(address);
    if (this.addressvalid)
      return this.nemAddress = this.nemService.nemAddress = address;

    this.nemAddress = "";
    this.addressvalid = false;
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
  }

  decrypt(){
    console.log("decrypt..")
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
