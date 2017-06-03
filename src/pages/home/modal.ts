import { Component } from "@angular/core";
import { Platform, NavParams, ViewController} from 'ionic-angular';

@Component({
    templateUrl: 'modal.html'
})

export class ModalContentPage{

    qrdata: any;
    data: any;

    constructor(private platform: Platform,private params: NavParams,private viewCtrl: ViewController){
        this.qrdata = this.params.get('qrData');
    }
    

    dismiss(){
        this.viewCtrl.dismiss();    
    }
}