import {Component, Input, ViewChild , ElementRef, ChangeDetectorRef,ViewEncapsulation} from 'angular2/core';
import {CORE_DIRECTIVES,NgClass} from 'angular2/common';
import {Injectable}     from 'angular2/core';
import {Http, Response, Headers} from 'angular2/http';
import {TRANSLATE_PROVIDERS, TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import {LocalSettingsService} from '../localsetting.service';
import {TimerWrapper} from 'angular2/src/facade/async';

import {BrowserDomAdapter} from 'angular2/platform/browser';
import {JSONP_PROVIDERS}  from 'angular2/http';
import {Observable}       from 'rxjs/Observable';

import {RequestEditImage} from './editimage.service';
import {Subject } from 'rxjs/Subject';

import { _settings } from '../settings';
import {Angulartics2GoogleAnalytics} from 'angulartics2/src/providers/angulartics2-google-analytics';
import {Angulartics2} from 'angulartics2';
import {Angulartics2On} from 'angulartics2';

import 'rxjs/Rx';
import {Modal, ModalDialogInstance, ICustomModal, ICustomModalComponent} from 'angular2-modal';
declare var jQuery:any;
export class EditImagesWindowData {
    editedStuff=null;
    lang = "en";

    constructor(
        public originalImageUrl: string,
        public resultEditMaskImageUrl: string,
        public obj,
        public apiUrl: string,
        public resultUrl: string = null,
        public editedStuff, // object of saved information from previous edited window
        public applyShadow,
        public applyTransparent:Boolean= false,
        public preversioResponseObj,
        public lastDataUrl:string = '';

    ) {
      this.originalImageUrl = obj.originalImageUrl;
      this.resultEditMaskImageUrl = obj.resultEditMaskImageUrl;
      this.resultUrl = obj.resultImageUrl;
    }

}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
    selector: 'modal-content',
    directives: [CORE_DIRECTIVES,NgClass, Angulartics2On],
    providers: [RequestEditImage, BrowserDomAdapter,LocalSettingsService , TranslateService],
    pipes: [TranslatePipe],
    encapsulation: ViewEncapsulation.Emulated,

    styleUrls : ['./assets/bootstrapmateriel/dist/css/bootstrap-material-design.min.css'],
    styles: [ require('../custom/'+ _settings.customer+'/customModal/edit.css')],
    template: require('../custom/'+ _settings.customer+'/customModal/edit.html')
})
@Injectable()
export class EditImagesWindow implements ICustomModalComponent {
    @ViewChild('canvasElement') canvasElement;
    @ViewChild('tempCanvas') tempCanvas;
    @ViewChild('image1Element') image1Element;
    @ViewChild('image2Element') image2Element;
    @ViewChild('imagewrapper') imagewrapper;
    @ViewChild('undoButton') undoButton;
    @ViewChild('colorFG') colorFGElement;
    @ViewChild('colorBG') colorBGElement;

    imagewrapperOverflow = 'hidden';
    showProccessError = 'none';
    maskHidden = false;
    imageWrapperMaxHeight;
    imagewrapperSizeWidth;
    isGreen = false;
    flagShowResult = false;
    AMOUNT_ZOOM = 0.05;
    dialog: ModalDialogInstance;
    context: EditImagesWindowData;
    obj;
    assetsUrl = _settings.assetsUrl;
    setdirection = 'ltr';
    setTextAlignDirection = "left";
    imageSizeWidth;
    totalZoom = 0;
    totalZoomInitial;
    public ctx;
    public ctxTemp;
    public paint_simple;
    public clickX_simple = new Array();
    public clickY_simple = new Array();
    public clickDrag_simple = new Array();
    public clickColor = new Array();
    public clickLineWidth = new Array();
    public canvas_simple;
    public context_simple;
    applyShadow = false;
    countEdits:Number = 0;
    public canvasWidth = 236;
    public canvasHeight =314;
    public colorBG = "rgb(255, 0, 0)";
    public colorFG = "rgb(0, 255, 0)";
    public colorChoosen = this.colorBG;
    totalScale =0;
    pendingRequest = null; // for edit
    preversioResponseObj;
    public apiUrl;
    flagFirstTime:Number = 0;
    showResultImage = 'none';
    displayLoader = 'none';
    displayShowInstructions = 'none';
    undoDataUrl = new Array();
    undoEditResponse = new Array();
    undoImageStack = [];
    undoImageMaskStack = [];
    initDataUrl = [];
    undoEditResponse = [];
    go = [];
    pressTimer;
    public srcImageResult ;
    public resultImageUrl;
  //  View_Result= "";
    editRequestSubject = new Subject();
    flagShouldInitizlize = true;
    showProccessErrorMessageTitle = "";
    showProccessErrorMessage = "";
    public showProccessErrorWidth = 397;
    loaderImage ;
    progressPercent = 0;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal, private elementRef: ElementRef,private cdr: ChangeDetectorRef,
      private requestEditImage: RequestEditImage, private _dom: BrowserDomAdapter,private http:Http, private translate: TranslateService, private _localSetting : LocalSettingsService
      ) {

        this.context = <EditImagesWindowData>modelContentData;
        this.translate.use(this.context.lang);

        if(this.context.lang == 'he'){
          this.setdirection = 'rtl';
          this.showProccessErrorWidth = "300";
          this.setTextAlignDirection = "right";
        }

    //    this.translate.get(value).subscribe(translatedValue => this.observer.next(translatedValue));

        this.View_Result = 'EDIT_PAGE_VIEW_BUTTON';
    // this.View_Result = this.create(value);//('EDIT_PAGE_VIEW_BUTTON');
     //console.log(this.translate.get(value));
        this.dialog = dialog;
        this.context = <EditImagesWindowData>modelContentData;
        //console.log(this.context);
        this.obj = this.context.obj;
        this.preversioResponseObj = {};

        this.apiUrl = this.context.apiUrl;
        this.applyShadow = this.context.applyShadow;
        this.undoDataUrl = new Array();
        this.undoEditResponse = new Array();
        this.redoDataUrl = [] ;
        this.redoImageMask = [];
        this.countEdits = 0; // count how many edits has done in the window.
      //  this.initDrawArrays();
        this.initDrawArrays(this.context.editedStuff);

        this.context.resultUrl = this.context.obj.resultImageUrl;


        var domIWant = _dom.query('.modal-dialog');
        _dom.setStyle(domIWant,'width','90%');
        this.srcImageResult = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
        this.calculateImageSize();

        this.editRequestSubject
          .switchMap((c) => this.http.post(c.a,  c.b,{ headers: c.header}))
          .map((res: Response) => res.json())
          .subscribe(res => this.showEditResponse(res.response));

        if(this.context.editedStuff != null &&  typeof this.context.editedStuff === 'object' ){
          this.flagShouldInitizlize = false;
        }
        if (!localStorage.malibuEditorFirstTime) {
            this.flagFirstTime = 1;
            localStorage.malibuEditorFirstTime = 1;
            this.showInstructions();
        }
//        this.showInstructions();
        if(this.context.obj.processingResult > 1 && this.context.obj.processingResult < 5 ){
          this.showProccessError = 'inline-block';
          this.create('PROCCESS_ERROR_MESSAGE.'+this.context.obj.processingResult);
          if(this.context.obj.processingResult !=5 ){
            this.translate.get('PROCCESS_ERROR_MESSAGE.TITLE_EDITOR').subscribe(translatedValue => {
              this.showProccessErrorMessageTitle =  translatedValue ;
            });
          }
        }
        this.loaderImage = this.assetsUrl+ "/assets/tools/malabiloader.gif";
        //console.log("constructor");
        //
    }

    create(value: string) {
      this.translate.get(value).subscribe(translatedValue => {
        this.showProccessErrorMessage =  translatedValue;
      });

    }

    onMouseWheelModal(e){
      if(e.ctrlKey){
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
    }

    onMouseWheel(e){

      //console.log(e.deltaX,e.deltaY);
    //  e.preventDefault();
    //  e.stopImmediatePropagation();
      if(e.deltaY <0){

        this.doZoom('in');
      } else {
        this.doZoom('out');
      }

    }
    calculateImageSize(){
      this.totalZoomInitial = -2;
      this.canvasWidth = this.obj.imageSize.width;
      this.canvasHeight = this.obj.imageSize.height;

      this.obj.origWidth = this.canvasWidth;
      this.obj.origHeight = this.canvasHeight;

      var windowWidth = window.innerWidth * 0.7;
      var windowHeight = (window.innerHeight -240) * 0.9; // 80 + 50+60+50
      this.imageWrapperMaxHeight = windowHeight;
      //windowWidth = windowWidth.toPrecision(2);
      //console.log(windowWidth, windowHeight);
      this.imagewrapperSizeWidth = this.obj.origWidth;
      var divide = 0;

      var divideHeight  = this.obj.imageSize.height / windowHeight;
      var divideWidth = this.obj.origWidth / windowWidth;

    //  console.log(this.obj.imageSize.height, this.obj.origHeight);
  //    console.log('height',windowHeight - this.obj.imageSize.height, divideHeight, this.obj.origHeight / divideHeight);
  //    console.log('width',windowWidth - this.obj.origWidth, divideWidth);

      if((windowHeight - this.obj.imageSize.height   ) < 0 ||   (windowWidth - this.obj.origWidth) < 0 ) {


        if(divideHeight >  divideWidth){
        //  console.log('to heigh');
          //console.log('height is longer',);
          divide = divideHeight;//this.obj.imageSize.height / windowHeight;
        } else {
          divide = divideWidth;//this.obj.origWidth / windowWidth;
      //      console.log('to wide');
        }

      } else {
      }

    //  console.log(divide);

      if(divide > 0){
         var numIn = 0;
          //  var divide = this.obj.origWidth / windowWidth;
            //var numIn = divide/ this.AMOUNT_ZOOM;
          //  console.log('numIn',numIn);
          //  var numIn = numIn.toPrecision(2);
          //  divide = numIn * this.AMOUNT_ZOOM;
        //   console.log('divide',divide);
        //  divide = Math.floor(divide);

            var a  = 1/divide;
            numIn = (1 - a) / this.AMOUNT_ZOOM;
        //    console.log('divide',divide,a);
      //       numIn = Math.floor(a);
            // divide = this.AMOUNT_ZOOM / numIn;

             divide = 1-(this.AMOUNT_ZOOM * numIn);
        //     divide = 0.4;

            var newHeight = this.obj.origHeight * divide;
            var newWidth = this.obj.origWidth  * divide;

            this.imageSizeWidth = newWidth;

            this.imageSizeHeight = newHeight;

            this.imagewrapperSizeWidth = newWidth;
            this.imagewrapperSizeheight = newHeight;
        //    console.log("newHeight",newHeight);
          //  this.imageWrapperMaxHeight = newHeight;
            this.canvasWidth = newWidth;
            this.canvasHeight = newHeight;
            this.totalZoom = -numIn;
            this.totalScale = divide;

            this.totalZoomInitial = -numIn;

      //      console.log('totalZoom',this.totalZoom);
            //if(this.canvasWidth > )
      }

      this.totalScale = 1+(this.AMOUNT_ZOOM * this.totalZoom);
    //  console.log("totalScale",this.totalScale);
    }

    undoEdit(){

        if(this.flagShowResult){
          return;
        }

        // console.log(this.undoDataUrl);
        // console.log(this.undoEditResponse);
        //
        // console.log("undo", this.undoDataUrl.length);

        var undoDataUrl = this.undoDataUrl;
        if(undoDataUrl.length <= 1){
          console.log("undoDataUrl is empty");
          return;
        }

      //  console.log(context);
        var image = undoDataUrl[undoDataUrl.length-2];
        var imageMask = this.undoEditResponse[undoDataUrl.length-2];

        this.undoImageStack.push(image);
        this.undoImageMaskStack.push(imageMask.resultEditMaskImageUrl);

        this.undoDataUrl.pop();
        this.undoEditResponse.pop();

        this.context.lastDataUrl = image;

        this.clearCanvas_simple();
    //    this.ctx.canvas.putImageData(image,0,0);

        this.context.resultEditMaskImageUrl= imageMask.resultEditMaskImageUrl;

        this.preversioResponseObj = imageMask;

        this.initDrawArrays();
        this.redrawSimple();

        this.setImageToCanvas(image);
        //  console.log("undo", this.undoDataUrl);
    }

    setImageToCanvas(image){
      var context = this.ctx;
      var _this = this;
      var imageObj = new Image();
      imageObj.onload = function() {
        context.drawImage(this, 0, 0);
        //console.log("done setImageToCanvas");
        //console.log(_this.canvasElement.nativeElement.toDataURL());
      };
      imageObj.src = image;
      this.ctx = context;
    }

    initDrawArrays(editFromPreviousOpenWindow ){

      if(editFromPreviousOpenWindow != null &&  typeof editFromPreviousOpenWindow === 'object' ){
        console.log("get last");
    /*    this.clickColor= editFromPreviousOpenWindow.clickColor;
        this.clickX_simple = editFromPreviousOpenWindow.clickX_simple;
        this.clickY_simple = editFromPreviousOpenWindow.clickY_simple;
        this.clickDrag_simple = editFromPreviousOpenWindow.clickDrag_simple;
        this.clickLineWidth = editFromPreviousOpenWindow.clickLineWidth;
*/
        this.undoDataUrl = editFromPreviousOpenWindow.undoDataUrl;
        this.undoEditResponse = editFromPreviousOpenWindow.undoEditResponse;

        this.initDataUrl = editFromPreviousOpenWindow.undoDataUrl.slice();
        this.initEditResponse = editFromPreviousOpenWindow.undoEditResponse.slice();

        this.preversioResponseObj.resultEditMaskImageUrl = this.context.editedStuff.undoEditResponse[this.context.editedStuff.undoEditResponse.length-1].resultEditMaskImageUrl;
        this.context.lastDataUrl = this.context.editedStuff.undoDataUrl[this.context.editedStuff.undoDataUrl.length-1];
      } else {

        this.clickColor= [];
        this.clickX_simple = [];
        this.clickY_simple = [];
        this.clickDrag_simple = [];
        this.clickLineWidth = [];
        this.preversioResponseObj.resultEditMaskImageUrl = this.obj.resultEditMaskImageUrl;

      }

    }

    clickInContainer(){
      if(this.flagFirstTime){
        this.displayShowInstructions = "none";
      }
    }

    doLongZoomDown(type){
      this.longPress = false;
      var _this = this;
      console.log("down");
      var repeat = function(){
        _this.doZoom(type);
        _this.pressTimer =  TimerWrapper.setTimeout(repeat, 100);
      }

      repeat();

    }

    doLongZoomUp(type){

        TimerWrapper.clearTimeout(this.pressTimer);
    }

    doZoom(type){

      var AMOUNT_ZOOM = this.AMOUNT_ZOOM;//0.09;
      var multiply = 0;
      var imgSizeWidth = document.getElementById('image1Element').offsetWidth;
      var imgSizeHeight = document.getElementById('image1Element').offsetHeight;
      var zoomW = 0;
      var zoomH = 0;
    //  console.log("totalZoomInitial", this.totalZoomInitial, this.totalZoom);

      if(this.totalZoomInitial > this.totalZoom && type == 'out'){
        //alert("no more zoom out");
        return;
      }
      if(15 < this.totalZoom && type == 'in'){
        //alert("no more zoom out");
        return;
      }
      if(this.totalZoom >0 ){
        var t = 1 + (AMOUNT_ZOOM * this.totalZoom);
        this.ctx.scale(-t,-t);
      }
      if(this.totalZoom < 0 ){
        var t = 1-(AMOUNT_ZOOM * this.totalZoom);
        this.ctx.scale(-t,-t);
      }
      //console.log('t', -t);
      if(type == 'in'){
        if(this.totalZoom == 0){
          this.totalZoom = 1;
        } else {
          this.totalZoom = this.totalZoom + 1;
        }
        var scale = 1 + (AMOUNT_ZOOM * this.totalZoom);
        var zoomW = this.obj.origWidth * scale;
        var zoomH = this.obj.origHeight * scale;
        if(this.totalZoom < 0 ){

          var totalZoom = - this.totalZoom;
          scale =  1-(AMOUNT_ZOOM * totalZoom);

          var zoomW = this.obj.origWidth * scale;
          var zoomH = this.obj.origHeight * scale;
    //      console.log('scale',scale);
        }

        this.ctx.canvas.width = zoomW;
        this.ctx.canvas.height = zoomH;
        this.ctx.scale(scale,scale);

      } else {
        // zoom out

        if(this.totalZoom == 0){
          this.totalZoom = -1;
        } else {
          this.totalZoom = this.totalZoom - 1;
        }

        var scale = (1 + (AMOUNT_ZOOM * this.totalZoom));

        this.totalScale = scale;
        //console.log(this.totalZoom);
        var zoomW = this.obj.origWidth * scale;
        var zoomH = this.obj.origHeight * scale;

        if(this.totalZoom < 0 ){

          var totalZoom = - this.totalZoom;
          scale =  1-(AMOUNT_ZOOM * totalZoom);
          //scale = -scale;
          var zoomW = this.obj.origWidth * scale;
          var zoomH = this.obj.origHeight * scale;

      //    console.log('zoomH',zoomH);
        }
        this.ctx.canvas.width = zoomW;
        this.ctx.canvas.height = zoomH;
        this.ctx.scale(scale,scale);
    //    this.ctx.scale(-0.1,-0.1);
      }

      if(this.totalZoomInitial >= this.totalZoom){
        this.imagewrapperOverflow  = 'hidden';
      } else {
        this.imagewrapperOverflow = "auto";
      }
      this.imagewrapper.nativeElement.scrollLeft = (this.imagewrapper.nativeElement.scrollWidth - this.imagewrapper.nativeElement.clientWidth) / 2
      //this.imagewrapper.nativeElement.scrollHeight = ( this.imagewrapper.nativeElement.clientHeight) / 2

      //this.imagewrapper.nativeElement.overflow = 'auto';
  //    console.log(type,scale, zoomW, zoomH);
    //  console.log(this.totalZoom);

      this.imagewrapperSizeWidth = zoomW;
      this.imagewrapperSizeheight = zoomH;

      this.imageSizeHeight = zoomH;
      this.imageSizeWidth = zoomW;
      this.redrawSimple();

      this.totalScale = 1+(this.AMOUNT_ZOOM * this.totalZoom);

//      console.log(this.image1Element.nativeElement);
    }


    resetSize(direction){
      var zoomH, zoomW;
      //console.log('resetSize totalZoom',this.totalZoom );
      if(this.totalZoom != 0){
        if(direction == 'down'){
          zoomW = this.obj.origWidth ;
          zoomH = this.obj.origHeight ;
          this.ctx.canvas.width = zoomW ;
          this.ctx.canvas.height = zoomH;

          this.imagewrapperSizeWidth = zoomW;
          this.imagewrapperSizeheight = zoomH;
        //  this.ctx.scale(-scale,-scale);
        } else {
          var imgSizeWidth = document.getElementById('image1Element').offsetWidth;
          var imgSizeHeight = document.getElementById('image1Element').offsetHeight;
          var scale =  (this.AMOUNT_ZOOM * this.totalZoom);
          if(this.totalZoom < 0 ){

            var totalZoom = -this.totalZoom;
            scale =  1- (this.AMOUNT_ZOOM * totalZoom);
            zoomW = this.obj.origWidth * scale ;
            zoomH = this.obj.origHeight * scale ;
          } else {
            scale = 1 +scale;
            zoomW = this.obj.origWidth * scale ;
            zoomH = this.obj.origHeight * scale ;
          }
          this.ctx.canvas.width = zoomW ;
          this.ctx.canvas.height = zoomH;

          this.imagewrapperSizeWidth = zoomW;
          this.imagewrapperSizeheight = zoomH;

          this.ctx.scale(scale,scale);
        }

      }


    //  console.log('reset',direction,zoomW,zoomH);
      this.imageSizeWidth = zoomW;
      this.imageSizeHeight = zoomH;
      this.redrawSimple();

    }

    getStyleBG() {

      if(this.isGreen == false){
        return "url("+this.assetsUrl+"'/assets/tools/background_chosen.png')";
      } else {
      //  this.colorBGElement.nativeElement.classList.add("fgChoosen");
        return "url("+this.assetsUrl+"'/assets/tools/background_unchosen.png')";
      }
    }

    setBgButtonActive(flag){
      if(flag){
        this.colorBGElement.nativeElement.classList.remove("bgUnChosen");
        this.colorBGElement.nativeElement.classList.add("bgChosen");
      } else {
        this.colorBGElement.nativeElement.classList.remove("bgChosen");
        this.colorBGElement.nativeElement.classList.add("bgUnChosen");
      }
    }

    setFgButtonActive(flag){
      if(flag){
        this.colorFGElement.nativeElement.classList.remove("fgUnChosen");
        this.colorFGElement.nativeElement.classList.add("fgChosen");
      } else {
        this.colorFGElement.nativeElement.classList.remove("fgChosen");
        this.colorFGElement.nativeElement.classList.add("fgUnChosen");
      }
    }


    getStyleFG() {
      if(this.isGreen == false){
        return "url("+this.assetsUrl+"'/assets/tools/object_unchosen.png')";
      } else {
        return "url("+this.assetsUrl+"'/assets/tools/object_chosen.png')";
      }
    }


    setImageScalingVariables(){

      var totalScale = 1+(this.AMOUNT_ZOOM * this.totalZoom);
      if(totalScale > 0){
        radius = 10 / totalScale;
      }
      if(this.totalScale < 0){
        radius = -(10 * totalScale);
      }
    }

    addClickSimple(x, y, dragging){
      var totalScale = this.totalScale;
  //    console.log(totalScale)
      //totalScale = 1;
  //    y = y -20;
      x= x+3;
      y= y+3;

      var radius =   4;
      if(totalScale > 0){
        x =  x/totalScale;
        y = y/totalScale;
        radius = radius / totalScale;
      }
      if(this.totalScale < 0){
        x =  -(x * totalScale);
        y = -(y * totalScale);
        radius = -(radius * totalScale);
      }

      this.clickX_simple.push(x);
    	this.clickY_simple.push(y);

    	this.clickDrag_simple.push(dragging);
      this.clickColor.push(this.colorChoosen);
    //  console.log("totalScale",this.totalScale);

      this.clickLineWidth.push(radius);
    }



    redrawSimple(redraw = false){

     //console.log('in redrawSimple');
      this.clearCanvas_simple();
    //  var canvas = this.ctx;
    //  this.ctxTemp.globalAlpha = 0.5;
    //	this.ctx.strokeStyle = "#fff";
      this.ctx.lineJoin = "round";
    //  this.ctx.lineCap = 'round';
      //this.ctx.lineWidth = radius;
      if(this.context.lastDataUrl.length > 1){
          this.setImageToCanvas(this.context.lastDataUrl);
      }


      for(var i=0; i < this.clickX_simple.length; i++)
      {
        //console.log("inredraw");
        this.ctx.strokeStyle = this.clickColor[i];
  //      this.ctx.globalCompositeOperation = "source-over";
        this.ctx.lineWidth = this.clickLineWidth[i];
      //  console.log('a');
        this.ctx.beginPath();
        if(this.clickDrag_simple[i] && i){
          this.ctx.moveTo(this.clickX_simple[i-1], this.clickY_simple[i-1]);
        }else{
          this.ctx.moveTo(this.clickX_simple[i]-1, this.clickY_simple[i]);
        }
        this.ctx.lineTo(this.clickX_simple[i], this.clickY_simple[i]);
        this.ctx.closePath();
        this.ctx.stroke();
      }

  //    this.ctxTemp.drawImage(this.canvasElement.nativeElement, 0, 0);
    }

    clearCanvas_simple()
    {
      //console.log('clearCanvas_simple',this.obj.origWidth, this.obj.origHeight);
    	this.ctx.clearRect(0, 0, this.obj.origWidth, this.obj.origHeight);
    //  this.ctxTemp.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    }

    getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }

    onMouseDown(e){

      //console.log('mouse down');
    //  var element = this.canvasElement.nativeElement;
      // let offset = element.offset();
      // Mouse down location
      //this.canvas.offset().left
  	//	var mouseX = e.pageX - e.layerX;
  //		var mouseY = e.pageY - e.layerY;
    //  console.log("mdown",e.layerX, e.layerY);
      var mousePos = this.getMousePos(this.canvasElement.nativeElement, e);
    //  console.log(mousePos);
      this.paint_simple = true;

  		this.addClickSimple(mousePos.x, mousePos.y, false);
      this.redrawSimple();
    }

    onMouseMove(e){
    		if(this.paint_simple){
        //  console.log("paint_simple true");
          var mouseX = e.pageX - e.layerX;
      		var mouseY = e.pageY - e.layerY;
            var mousePos = this.getMousePos(this.canvasElement.nativeElement, e);
              this.addClickSimple(mousePos.x, mousePos.y, true);

    //			this.addClickSimple(e.layerX, e.layerY, true);
    			this.redrawSimple();
    		}
        //console.log(e.layerX, e.layerY);
    }

    onMouseUp(e){
        this.paint_simple = false;
      //  this.redrawSimple();

        this.preformEditRequest();

    }

    onMouseLeave(e){

      if(this.paint_simple == true){
        this.preformEditRequest();
      }

      this.paint_simple = false;

    }

    setColor(chossen){
       if (chossen == 'colorFG') {
        this.colorChoosen = this.colorFG;
        this.setFgButtonActive(true);
        this.setBgButtonActive(false);
      } else {
        this.setFgButtonActive(false);
        this.setBgButtonActive(true);
        this.colorChoosen = this.colorBG;
      }

      if(this.flagShowResult){
        this.showResultImage =  "none";
        this.maskHidden = false;
        this.View_Result = 'EDIT_PAGE_VIEW_BUTTON';
        this.undoButton.nativeElement.classList.remove("undoDisabled");
        this.undoButton.nativeElement.removeAttribute("disabled", "disabled");

        //this.colorBGElement.nativeElement.classList.add("bgUnChosen");
        this.flagShowResult = false;

      }

      this.isGreen = (chossen == 'colorFG') ? true: false;
      this.getStyleFG();
      this.getStyleBG();
      this.colorBGElement.classMap;
    }

    backToEdit(){

      this.setColor('colorBG');
    }

    // do matting
    showResult(){
      if(this.flagShowResult){

        this.backToEdit();
        return false;
      }


      this.setFgButtonActive(false);
      this.setBgButtonActive(false);

      this.undoButton.nativeElement.classList.add("undoDisabled");
      this.undoButton.nativeElement.setAttribute("disabled", "disabled");
      this.runMatting();
      return false;
    }


    runMatting(isSaveRequest){
      //console.log(this.preversioResponseObj);
      var dataURL = this.canvasElement.nativeElement.toDataURL();
      this.displayLoader = 'block';
      this.loaderImage = this.assetsUrl+ "/assets/tools/malabiloader.gif";
      this.startLoader();
      this.requestEditImage.search(dataURL,
        this.obj.originalImageUrl,
        this.obj.imageId,
        this.obj.customerId,
        this.obj.sessionId,
        this.apiUrl,
        this.context.resultEditMaskImageUrl,
        true,this.applyShadow, this.context.applyTransparent
        ).subscribe(a => this.showResultResponse(a.response,isSaveRequest));
        this.startLoader();
    }

    startLoader(){

      this.width = 0;
      this.progressPercent = 30;

      this.timeProgress = TimerWrapper.setInterval(frame, 1);
      var _this = this;
      function frame() {
        //console.log("A");
        if (_this.progressPercent >= 100) {
          //  TimerWrapper.clearInterval(_this.timeProgress);
          _this.progressPercent = 0;
          } else {
            _this.progressPercent +20;
        }
      }
    }

    stopLoader(){
      if(this.progressPercent > 0)
        TimerWrapper.clearInterval(this.timeProgress);
      this.progressPercent = 0;
    }

    // after matting
    showResultResponse(ob,isSaveRequest){
      this.displayLoader = 'none';
      this.loaderImage = this.assetsUrl+ "/assets/tools/smallloader.gif";
      this.stopLoader();

      var resImage= ob.resultImageUrl;
      this.srcImageResult = ob.resultImageUrl;
      this.resultImageUrl = ob.resultImageUrl;
      console.log(ob.resultImageUrl);
      //this.context.resultEditMaskImageUrl = resImage;
      this.showResultImage = 'block';
      this.maskHidden = true;
  //    this.image1Element.style.visibility = 'hidden';
  //    this.canvasElement.style.visibility = 'hidden';
      this.flagShowResult = true;
      this.View_Result= "EDIT_PAGE_BACK_TO_EDIT_BUTTON";

      if(isSaveRequest){
        this.openResultWindow();

      }
    }

    openResultWindow(){
      console.log("openResultWindow",this.resultImageUrl);
      this.context.resultUrl = this.resultImageUrl;

      if(this.undoEditResponse.length <= 1){
      //  this.undoEditResponse = [];
      //  this.undoDataUrl = [];
      }

      this.context.editedStuff = {
        'clickColor':this.clickColor,
        'clickX_simple':this.clickX_simple,
        'clickY_simple':this.clickY_simple,
        'clickDrag_simple':this.clickDrag_simple,
        'clickLineWidth':this.clickLineWidth,
        'undoDataUrl':this.undoDataUrl,
        'undoEditResponse':this.undoEditResponse
      }

      this.dialog.close('openResult');
    }


    preformEditRequest(){
      //console.log(this.ctx.canvas.width, this.ctx.canvas.height);
      //apply the old canvas to the new one
    //  context.drawImage(this.ctx.canvas, 0, 0);
    //  console.log("preformEditRequest");
      var dataURL = this.canvasElement.nativeElement.toDataURL();
    //  console.log(dataURL);
      if(this.totalZoom != 0){
        this.resetSize('down');
        dataURL = this.canvasElement.nativeElement.toDataURL();
        this.resetSize('up');
      }
        //console.log(dataURL);
      this.disableShowResult = true;
      this.disableSaveImage = true;
      this.disableUndoButton = true;

      if(this.isGreen == true){
        this.disableColorBG = true;

      } else {
        this.disableColorFG = true;
      }
      //  console.log(dataURL);
      this.displayLoader = 'block';
      this.loaderImage = this.assetsUrl+ "/assets/tools/malabiloader.gif";
      this.startLoader();
      var creds = {"origImgUrl": this.obj.originalImageUrl,
        "imageId": this.obj.imageId,
        "sessionId": this.obj.sessionId,

        "customerId": this.obj.customerId,
        "doMatting": false,
        "previousMaskUrl": this.preversioResponseObj.resultEditMaskImageUrl,
        "shadow": this.applyShadow,
        "transparent": this.context.applyTransparent,
        "userInputImageData": dataURL
      };

      var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      var  credsa = this.param(creds);

      this.dataURL = dataURL;
      this.editRequestSubject.next({a:this.apiUrl,b:credsa,header:headers});

    }

    param(object) {
     var encodedString = '';
     for (var prop in object) {
         if (object.hasOwnProperty(prop)) {
             if (encodedString.length > 0) {
                 encodedString += '&';
             }
             encodedString += encodeURI(prop + '=' + object[prop]);
         }
     }
     return encodedString;
    }

    /*
    * Call back function after edit response;
    */
    showEditResponse(a){
      this.undoDataUrl.push(this.dataURL);
      this.undoEditResponse.push(a);
      this.undoImageStack.push(this.dataURL);

      this.countEdits ++;
      this.displayLoader = 'none';
      this.loaderImage = this.assetsUrl+ "/assets/tools/smallloader.gif";
      this.stopLoader();
      this.disableShowResult = false;
      this.disableSaveImage = false;
      this.disableUndoButton = false;

      if(this.isGreen == true){
        this.disableColorBG = false;

      } else {
        this.disableColorFG = false;
      }
      if(a.resultEditMaskImageUrl ){
        this.preversioResponseObj = a;
        //document.getElementById('image2Element').src = a.resultEditMaskImageUrl;
        this.context.resultEditMaskImageUrl = a.resultEditMaskImageUrl;
        this.undoImageMaskStack.push(a.resultEditMaskImageUrl);
      }
    }

    showInstructions(){

      this.displayShowInstructions = 'block';


    }

    ngAfterViewInit() {

      this.ctx = this.canvasElement.nativeElement.getContext("2d");
      this.ctx.scale(this.totalScale,this.totalScale);
      if(this.flagShouldInitizlize == true){
        var dataURL = this.canvasElement.nativeElement.toDataURL();
        this.undoDataUrl.push(dataURL);
        this.undoEditResponse.push(this.obj);

      }

      //console.log("ngAfterViewInit",this.undoDataUrl);
    }

    ngOnChanges(){
//        console.log("changes",document.getElementById('image1Element').offsetWidth);

    }
    ngOnInit() {
     // we need to detach the change detector initially, to prevent a
     // "changed after checked" error.

     var _this = this;
     window.onresize = function() {
        _this.cdr.detectChanges();
          //_this.cdr.detach();
          _this.calculateImageSize();
        //  console.log("resize");
          _this.redrawSimple();

        //  console.log((window.outerWidth - 8) / window.innerWidth);

       };
   }

    beforeDismiss(): boolean {
        return true;
    }

    closeWindow(type) {


      if(this.countEdits > 0){
        var i;
        for (i = 0; i < this.countEdits; i++) {
          this.undoEdit();
          //console.log('undo ' + this.countEdits);
        }
        this.lastDataUrl = '';

      }

      this.countEdits = 0;

      if(this.initDataUrl.length > 0 ){
        //console.log(this.initDataUrl);
        this.context.editedStuff.undoDataUrl = this.initDataUrl;
        this.context.editedStuff.undoEditResponse = this.initEditResponse.slice();
        this.context.resultEditMaskImageUrl = this.context.editedStuff.undoEditResponse[this.context.editedStuff.undoEditResponse.length-1].resultEditMaskImageUrl;

      }
      this.dialog.close(false);
    }

    saveImage(){

      if(this.flagShowResult == false){
        this.runMatting(true);
        return false;
      }
      this.openResultWindow();

      /*
      var link = document.createElement("a");
      link.download = "yourfile";
      link.href = this.srcImageResult;
      link.click();
      */
      return false;
    }

    param(object) {
      var encodedString = '';
      for (var prop in object) {
          if (object.hasOwnProperty(prop)) {
              if (encodedString.length > 0) {
                  encodedString += '&';
              }
              encodedString += encodeURI(prop + '=' + object[prop]);
          }
      }
      return encodedString;
    }


}
