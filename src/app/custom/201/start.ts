import {Component, Input,ViewChild, EventEmitter, ElementRef,NgZone} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {LocalSettingsService} from '../../localsetting.service';

import {Modal, ModalDialogInstance, ICustomModal, ICustomModalComponent} from 'angular2-modal';
import {BrowserDomAdapter} from 'angular2/platform/browser';

import {ShowimageService} from '../showimage.service';
import {ModalDialogInstance, ModalConfig, Modal, ICustomModal,
    YesNoModalContent, YesNoModal} from 'angular2-modal';
import { provide, ElementRef, Injector,
        IterableDiffers, KeyValueDiffers, Renderer} from 'angular2/core';
import {EditImagesWindowData, EditImagesWindow} from '../../customModal/editModal';
import {ShowAlterImagesWindowData, ShowAlterImagesWindow} from '../../customModal/showAlterImagesModal';

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
    selector: 'start',
    directives: [CORE_DIRECTIVES],
    providers: [ BrowserDomAdapter , Modal],
    pipes: [],

    styles: [`
        .custom-modal-container {
            padding: 15px;
            background: #F9F9F9;
        }
        .modalImageWrapper{
          max-height:70%;
          width:36%;
          float:left;
          display:block;
          text-align:center;
          background-size:100%;
          padding:8px;
        }

        .custom-modal-header {
            background-color: #1C6EB5;
            color: #fff;
            -webkit-box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.75);
            -moz-box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.75);
            box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.75);
            margin-top: -15px;
            margin-bottom: 20px;
            height:45px;
            vertical-align: text-top;
            padding-top:8px;
            background: #fe7011 url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA8YAAAAiCAYAAACdrMDIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ5OTRGREZFQkIwMzExRTNBRTUzOEUxOTc2ODY2NEYzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ5OTRGREZGQkIwMzExRTNBRTUzOEUxOTc2ODY2NEYzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDk5NEZERkNCQjAzMTFFM0FFNTM4RTE5NzY4NjY0RjMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDk5NEZERkRCQjAzMTFFM0FFNTM4RTE5NzY4NjY0RjMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6rtwFGAAAZ2klEQVR42uydSZIjSXJF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') no-repeat;
        }
        .imagewrapper{
          width: 70%;
          margin: 0 auto;
        }
        .mdImage{
          max-width:100%;
          max-height:180px;

          -webkit-box-shadow: 0 5px 15px rgba(0,0,0,.5);
          box-shadow: 0 5px 15px rgba(0,0,0,.5);
                    margin-bottom:30px;
        }
        .headerText{
        //  font-size:20px;
        //  font-weight:bold;


        }
        .imagewrapper button {
          height: 45px;
        }
        .editImage {
          width: 111px;
          height: 45px;
          background:url('/assets/tools/edit_icon.png')  no-repeat left;
          color: white;
          background-color: black;
          text-align:right;
          background-position-x: 4px;
        }

        .saveimage {
          background-color:#44c767;
          -moz-border-radius:4px;
          -webkit-border-radius:4px;
          border-radius:4px;
          border-color: #44c767;
          display:inline-block;
          cursor:pointer;
          color:#ffffff;
          font-family:Arial;
          font-size:16px;

              height: 40px;
          text-decoration:none;

        }
        .saveimage:hover {
          background-color:#5cbf2a;
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
          border:1px solid #18ab29;
          display:inline-block;
          cursor:pointer;
          color:#67d63c;
          font-family:Arial;
            font-size:16px;

                height: 40px;
          text-decoration:none;
        }
        .viewResult:hover {

        }
        .viewResult:active {
          position:relative;
          top:1px;
        }
        .arrowleft {
          width: 0;
          height: 0;
          border-top: 22px solid transparent;
          border-bottom: 22px solid transparent;
          border-right: 22px solid #FE7011;
          float:left;
          margin-top: 17%;
        }
        .finishBtn{
              background-color: #fe7112;
            text-align: center;
            border-radius: 5px;
            display: inline-block;
            zoom: 1;
            margin-left: 15px;
            padding: 4px 15px;
        }
        .yellow{
            background-color: #f2b805;
        }
  .finishBtn .text {
    display: inline-block;
    text-decoration: none;
    font-family: "spoilerBold";
    color: #ffffff;
    font-size: 28px;
    cursor: pointer;
    height: 42px;
    line-height: 42px;
    vertical-align: top;
    padding-right: 6px;
}
.circle {
    display: inline-block;
    zoom: 1;
    vertical-align: middle;
    border-radius: 100px;
    width: 39px;
    height: 39px;
    line-height: 39px;
    background-color: #ffffff;
}
.circle i.iorange {

    vertical-align: sub;
}
orange{
  color: #fe7112;
}
.yellowcircle {
  color: #f2b805;
  vertical-align: sub;
}
.green-background {
  background-color: #6fbc24;
}
.green {
  color: #6fbc24;
}
.finishBtn .circle i {
    font-size: 28px;
}
.fa {
    display: inline-block;
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
    `],
    //TODO: [ngClass] here on purpose, no real use, just to show how to workaround ng2 issue #4330.
    // Remove when solved.
    /* tslint:disable */ template: `

        `
})
export class ShowAlterImagesYad2  {
    @ViewChild('image1Element') image1Element;
    @ViewChild('image2Element') image2Element;
    mod;
    obj;
    flagNew = true;

    closeedit ;

    static modalConfigs = {

      'customWindow': new ModalConfig("md", true, 27)
    };

    constructor(private modal: Modal, private _dom: BrowserDomAdapter, public showimageService: ShowimageService,
      private elementRef: ElementRef,public _localSetting : LocalSettingsService,private _ngZone: NgZone) {
    //    this.dialog = dialog;

        console.log(showimageService);
        this.img1 = showimageService.originalImageUrl;
        this.img2 = showimageService.resultImageUrl;

        this.apiUrl = showimageService.apiUrl;
      //  this.showimageService.resultEditMaskImageUrl = showimageService.resultImageUrl;
        var path = showimageService.originalImageUrl;

        var url = path.substring(0, path.lastIndexOf("/") + 1);
        console.log(url);
        var m = path.match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/)
        var fileName = (m === null)? "" : m[0]
        var fileExt  = (m === null)? "" : m[1]
        console.log(m);
        var maskUrl = url + m[1] + "_MASK_gen0.png";
        var sessionId=url.substring(url.lastIndexOf("SID"),url.lastIndexOf("/"));

      //  var url = url.substring(0, url.lastIndexOf("/") + 1);
        console.log(url);
        this.obj = {
          "originalImageUrl": showimageService.originalImageUrl,
          "resultImageUrl": showimageService.resultImageUrl,
          "resultEditMaskImageUrl": maskUrl,
          "sessionId":sessionId,
          "imageId":"1",
          "customerId":showimageService.customerId
        }

        this.obj.imageSize = {};
        this.obj.imageSize.height = showimageService.imageSizeHeight;//this.image1Element.nativeElement.naturalHeight;
        this.obj.imageSize.width = showimageService.imageSizeWidth;//this.image1Element.nativeElement.naturalWidth;
    //s    var a = showimageService.picWidth *2+80;
    
    //    this.translate.use(_localSetting.getLanguage());

        this.closeedit= new EventEmitter();

        window.camera51Start = {
             zone: this._ngZone,
             openEdit: (value) => this.openEdit(),
             component: this
           };

    }

    openEdit() {
        //this.zone.run(() => {
          var _this = this;
          setTimeout(function(){
            _this.edit('edit');

      }, 1);

      //    this.someValue = value;
        //});
      }

    beforeDismiss(): boolean {
        return true;
    }

    edit(type){
    //  console.log(this.image1Element.nativeElement.naturalHeight);
    console.log(this);
      this.openDialog(type, this.img1, this.img2, this.obj);
      //this.closeedit.next(event);

    }

    openDialog(type: string,img1: string,img2: string, obj) {
      let dialog:  Promise<ModalDialogInstance>;
      this.dialog = dialog;
      var component = null;
      var mod;
      var res;
      var config = new ModalConfig("lg", true, 27);
      if(type == 'edit'){

        if(this.flagNew == true){
          this.lastResultUrl = img2;
          this.mod = new EditImagesWindowData(img1,img2,obj,this.apiUrl);
          this.mod.applyShadow = this.applyShadow;
          this.mod.applyTransparent = this.applyTransparent;
          this.mod.lang = this._localSetting.getLanguage();
          this.flagNew = false;
        } else {
          console.log(this.mod);
        //  this.mod = new EditImagesWindowData(img1,img2,obj,this.apiUrl);

        }
        console.log(this.mod);
        config = new ModalConfig("lg", true, 27);
        component = EditImagesWindow ;//(type === 'customWindow') ? AdditionCalculateWindow : YesNoModal;
        let bindings = Injector.resolve([
          provide(ICustomModal, {useValue: this.mod})
        ]);
      }

      dialog = this.modal.open(
        <any>component,
        bindings,
        config);

        dialog.then((resultPromise) => {
          return resultPromise.result.then((result) => {
          //  this.lastModalResult = result;

            if(result == "openEdit"){
              this.openDialog('edit',img1,img2,obj);
            }
            // close edit window with out save.
            if(result == false){

              if(this.lastResultUrl == ''){
                res = img2;
                console.log("res",res);
              } else {
                res = this.lastResultUrl;
              }

              if(this.lastEditedStuff != null){

                this.mod.editedStuff = this.lastEditedStuff;

              }
              this.saveImage(false);
              return false;

            } // end false;
          //  console.log(mod);
            if(result == "openResult"){
              this.saveImage(this.mod.resultUrl);
              return false;
            }
          }, () => this.lastModalResult = 'Rejected!');
        });
      }

    saveImage(result){

      window.backgroundRemovalCallback(result);

      return false;
  }



  ngAfterViewInit() {

    // var _this = this;
    // setTimeout(function(){
    //   _this.edit('edit');

    // }, 1);
  }

}
