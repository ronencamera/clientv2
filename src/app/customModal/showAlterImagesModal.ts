import {Component, Input,ViewChild, EventEmitter, ChangeDetectorRef} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {LocalSettingsService} from '../localsetting.service';

import {Modal, ModalDialogInstance, ICustomModal, ICustomModalComponent} from 'angular2-modal';
import {BrowserDomAdapter} from 'angular2/platform/browser';
import {TRANSLATE_PROVIDERS, TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import {Angulartics2GoogleAnalytics} from 'angulartics2/src/providers/angulartics2-google-analytics';
import {Angulartics2} from 'angulartics2';
import {Angulartics2On} from 'angulartics2';
import { _settings } from '../settings';

export class ShowAlterImagesWindowData {

    applyTransparent;

    constructor(
        public num1: string,
        public num2: string,
        public picWidth: number,
        public picHeight: number,
        public obj
    ) {

      //this.picHeight = "100";
    }
}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
    selector: 'modal-content',
    directives: [CORE_DIRECTIVES, Angulartics2On],
    providers: [ BrowserDomAdapter ,TranslateService, LocalSettingsService],
    pipes: [TranslatePipe],

    events: ["closeedit"],
    styles: [`

        .custom-modal-container {
          padding: 15px;
          background: white;
        }
        .modalImageWrapper{
          max-height:70%;
          width:49%;

          display:block;
          text-align:center;
          background-size:100%;
          padding:8px;
        }
        .custom-modal-header {
          background-color: #1D5A90;
          color: #fff;
          -webkit-box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.75);
          -moz-box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.75);
          box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.75);
          margin-top: -15px;
          margin-bottom: 20px;
          height:45px;
          vertical-align: text-top;
          padding-top:8px;
        }
        .imagewrapper{
          width: 100%;

        }
        .mdImage{
          max-width:91%;
          max-height:100%;
          -webkit-box-shadow: 0 5px 15px rgba(0,0,0,.5);
          box-shadow: 0 5px 15px rgba(0,0,0,.5);
          margin-bottom:10px;
        }
        .headerText{
          font-size:20px;
        }
        .imagewrapper button {
          height: 45px;
        }
        .btnSize {
          font-size:13px;
        }
        .editImage {
          width: 90px;
          background:url('/assets/tools/edit_icon.png')  no-repeat left;
          background-size: 26px;
          text-align:right;
          background-position-x: 4px;
          padding-right: 4px;
          background-color:#555;
        	-moz-border-radius:4px;
        	-webkit-border-radius:4px;
        	border-radius:4px;
          border-color: #555;
        	display:inline-block;
        	cursor:pointer;
        	color:#ffffff;
        	font-family:Arial;
        	text-decoration:none;
        }
        .editImage:hover {
          background-color:black;
          color:#ffffff;
          border-color: black;
        }
        .editImage:active {
          background-color:black;
          color:#ffffff;
          border-color: black;
        }
        .saveimage {
        	background-color:#53aac9;
        	-moz-border-radius:4px;
        	-webkit-border-radius:4px;
        	border-radius:4px;
          border-color: #53aac9;
        	display:inline-block;
        	cursor:pointer;
        	color:#ffffff;
        	font-family:Arial;
        	text-decoration:none;
        }
        .saveimage:hover {
        	background-color:#1D5A90;
          color:#ffffff;
        }
        .saveimage:active {
        	position:relative;
        	top:1px;
        }
        .viewResult {
        	background-color:#ffffff;
        	-moz-border-radius:4px;
        	-webkit-border-radius:4px;
        	border-radius:4px;
        	border:1px solid #53aac9;
        	display:inline-block;
        	cursor:pointer;
        	color:#53aac9;
        	font-family:Arial;
        	text-decoration:none;
        }
        .viewResult:hover {
          background-color:#ffffff;
          border:1px solid #53aac9;
        }
        .viewResult:active {
        	position:relative;
        	top:1px;
          background-color:#ffffff;
          border:1px solid #53aac9;
        }
        .table {
          display:table;
        }
        .table-row {
          display:table-row;
        }
        .table-cell{
          display:table-cell;
        }

    `],
    template: require('../custom/'+ _settings.customer+'/customModal/showAlterimage.html')
    //TODO: [ngClass] here on purpose, no real use, just to show how to workaround ng2 issue #4330.
    // Remove when solved.
    /* tslint:disable */

})
export class ShowAlterImagesWindow implements ICustomModalComponent {
    dialog: ModalDialogInstance;
    context: ShowAlterImagesWindowData;
    @ViewChild('image1Element') image1Element;
    @ViewChild('image2Element') image2Element;
    closeedit ;
    picHeightInDiv = 0;
    showProccessErrorMessage ='';
    showResultImage = 'inline';
    showProccessError ='none';
    setdirection = 'ltr';

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal,private _dom: BrowserDomAdapter,private translate: TranslateService,
      private _localSetting : LocalSettingsService, private _changeDetectionRef : ChangeDetectorRef) {
        this.dialog = dialog;
        this.context = <ShowAlterImagesWindowData>modelContentData;

        console.log(this.context.obj.sessionId);
        var a = this.context.picWidth *2+80;

        this.translate.use(this.context.lang);

        if(this.context.lang == 'he'){
          this.setdirection = 'rtl';
          this.setTextAlignDirection = "right";
        }

        this.closeedit= new EventEmitter();
        var domIWant = _dom.query('.modal-dialog');
      //  _dom.setStyle(domIWant,'width','90%');
        if(a > 600)
          _dom.setStyle(domIWant,'max-width',a+"px");

        var windowHeight = (window.innerHeight -200) * 0.9; // 80 + 50+60+50
        this.imageWrapperMaxHeight = windowHeight;
        this.modalImageWrapperMaxHeight = window.innerHeight * 0.9;
// 2.44
        this.picHeightInDiv =  this.context.picHeight;
        if(this.context.picWidth > this.context.picHeight){
          this.picHeightInDiv =  this.context.picHeight / (this.context.picWidth / 262);
        }
        if(this.context.picWidth < this.context.picHeight){
          this.picHeightInDiv =  this.context.picWidth / (this.context.picHeight / 262);
        }

        if(this.context.obj.processingResult > 0 && this.context.num2 == '' ){

          this.showResultImage = 'none';
          this.showProccessError = 'inline-block';
        //  this.create('PROCCESS_ERROR_MESSAGE.'+this.context.obj.processingResult);
          this.showProccessErrorMessageTitle = "";
          if(this.context.obj.processingResult !=5 ){
            this.translate.get('PROCCESS_ERROR_MESSAGE.TITLE').subscribe(translatedValue => {
              this.showProccessErrorMessageTitle =  translatedValue +"<br>";
            });
          }
          this.translate.get('PROCCESS_ERROR_MESSAGE.'+this.context.obj.processingResult).subscribe(translatedValue => {
            this.showProccessErrorMessage =  translatedValue;
          });
        } else {
          this.showProccessError = 'none';
        }
        console.log("constructor");
    }

    create(value: string) {
      this.translate.get(value).subscribe(translatedValue => {
        this.showProccessErrorMessage =  translatedValue;
      });

    }

    beforeDismiss(): boolean {
        return true;
    }
    close() {
            this.dialog.close();
    }

    edit(event){
      this.dialog.close('openEdit');
      //this.closeedit.next(event);

    }

    ngOnInit(){


    }

    saveImage(num){
      var sUrl = this.context.num2;

      window.downloadFile = function (sUrl) {

      //iOS devices do not support downloading. We have to inform user about this.
      if (/(iP)/g.test(navigator.userAgent)) {
          alert('Your device does not support files downloading. Please try again in desktop browser.');
          return false;
      }

      //If in Chrome or Safari - download via virtual link click
      if (window.downloadFile.isChrome || window.downloadFile.isSafari) {
          //Creating new link node.
          var link = document.createElement('a');
          link.href = sUrl;

          if (link.download !== undefined) {
              //Set HTML5 download attribute. This will prevent file from opening if supported.
              var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
              link.download = fileName;
          }

          //Dispatching click event.
          if (document.createEvent) {
              var e = document.createEvent('MouseEvents');
              e.initEvent('click', true, true);
              link.dispatchEvent(e);
              return true;
          }
      }

      // Force file download (whether supported by server).
      if (sUrl.indexOf('?') === -1) {
          sUrl += '?download';
      }

      window.open(sUrl, '_self');
      return true;
  }

  window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

  downloadFile(sUrl);
    }

    saveImageEvent(){
      console.log("saveImage");
      if ( typeof window.backgroundRemovalCallback == 'function' ) {
        window.backgroundRemovalCallback();
      }
      this.dialog.close();

      return false;
  }

}
