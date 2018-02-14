import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner'
import { HomePage } from '../home/home';
import { NemService } from "../../services/nem.service";


@IonicPage()
@Component({
  selector: 'page-start',
  templateUrl: 'start.html',
})
export class StartPage {

  private walletPassword: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private nemService: NemService,
    public barcodeScnr: BarcodeScanner,
    public alrtCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StartPage');
  }

  walletScan() {
    this.showPrompt();
  }

  barcodeScan() {
    let prv = "d62cc1d91267734f2a9c583cab70b0c922a110188a9243a12e8b9c7d5bf85d4c";

    this.barcodeScnr.scan()
      .then((bd) => {
        if (bd.format !== "QR_CODE") {
          return this.showAlert("Error", "Invalid QR code.");
        }

        //Scan qr code then move to second page with them details
        let info = JSON.parse(bd.text).data;

        this.nemService.decryptWalllet(info, this.walletPassword)
          .then((res) => {
            console.log(`Decrypted: ${res}\nPrivate Key: ${prv}`);
            //Move to the next page with the goods
            if(res == null || res == "")
              return this.showAlert("Error", "Invalid QR code.");
            
            return this.navCtrl.push(HomePage, { prvKey: res})
          })
      })
      .catch((err) => {
        return this.showAlert("Error", err.message);
      })
  }


  manualEntry() {
    this.navCtrl.push(HomePage);
  }


  showAlert(title, message) {
    this.alrtCtrl.create({
      title: title,
      message: message,
      buttons: ['Ok']
    }).present();
  }

  showPrompt() {
    let prompt = this.alrtCtrl.create({
      title: 'Password',
      message: "Enter wallet password",
      inputs: [
        {
          name: 'password',
          placeholder: 'password'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Enter',
          handler: data => {
            this.walletPassword = data.password;
            //
            this.barcodeScan();
          }
        }
      ]
    });

    prompt.present();
  }
}
