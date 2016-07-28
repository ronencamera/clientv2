import {
  Component, Input, ViewChild, ElementRef,
  ChangeDetectorRef, ViewEncapsulation, NgZone
} from '@angular/core';
import {CORE_DIRECTIVES, NgClass} from '@angular/common';
import {Injectable}     from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {TimerWrapper} from '@angular/core/src/facade/async';

import {Angulartics2GoogleAnalytics} from 'angulartics2/src/providers/angulartics2-google-analytics';

import {Angulartics2On} from 'angulartics2';

import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
import {JSONP_PROVIDERS}  from '@angular/http';
import {Observable}       from 'rxjs/Observable';

import {RequestEditImage} from './editimage.service';
import {Subject} from 'rxjs/Subject';

import {_settings} from '../settings';
import {ShowimageService} from './showimage.service';

import 'rxjs/Rx';

var greenloader = require("url?mimetype=image/png!../../assets/tools/green_pointer_6.png");
//var greenloaderCur = require("url?mimetype=image/png!../../../assets/tools/green_pointer_6_lastone.cur");

var redloader = require("url?mimetype=image/png!../../assets/tools/red_pointer_6.png");
//var redloaderCur = require("url?mimetype=image/png!../../../assets/tools/red_pointer_6_lastone.cur");

var transparentImage = require("url?mimetype=image/png!../../assets/tools/transparent_bg.png");

@Component({
  selector: 'editor',
  directives: [CORE_DIRECTIVES, NgClass, Angulartics2On],
  providers: [RequestEditImage, BrowserDomAdapter, Angulartics2GoogleAnalytics],
  // pipes: [TranslatePipe],
  encapsulation: ViewEncapsulation.Emulated,

  styles: [require('./editor.css'),
    `
    .cursorRed{
      cursor: url('https://assets-malabi.s3.amazonaws.com/apiexample/assets/tools/red_pointer_6_lastone.cur'), auto;
      cursor: url(` + redloader + `) 0 0, auto;
    }
    .cursorGreen {
      cursor: url('https://assets-malabi.s3.amazonaws.com/apiexample/assets/tools/green_pointer_6_lastone.cur'), auto;
      cursor: url(` + greenloader + `) 0 0, auto;
    }
    .transparentBg {
        background-image: url(` + transparentImage + `);
    }
    .imagewrapperBox {
      -webkit-box-shadow: rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px;;
      box-shadow:  rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px;;
    }
    `
  ],
  template: require('./editor.html')
})
@Injectable()
export class Editoraa {
  @ViewChild('canvasElement') canvasElement;
  @ViewChild('image1Element') image1Element;
  @ViewChild('image2Element') image2Element;
  @ViewChild('imagewrapper') imagewrapper;
  @ViewChild('undoButton') undoButton;
  @ViewChild('colorFG') colorFGElement;
  @ViewChild('colorBG') colorBGElement;

  lastDataUrl:string = '';
  showWrapperShadow = true;
  wrapperShadow = "0 5px 15px rgba(0,0,0,.5)";
  imagewrapperOverflow = 'hidden';
  wrappermarginTop = "0";
  maskHidden = false;
  imageWrapperMaxHeight;
  greenloader = greenloader;//= require("url?mimetype=image/png!../../../assets/tools/green_pointer_6.png");
  sessionId:string;
  imagewrapperSizeWidth;
  isGreen = false;
  flagShowResult = false;
  AMOUNT_ZOOM = 0.05;
  obj:Object;
  assetsUrl = _settings.assetsUrl;
  imageSizeWidth;
  disableSaveImage;
  disableColorBG;
  disableUndoButton;
  disableColorFG;
  totalZoom = 0;
  decreaseInnerHeight:number = 10;
  totalZoomInitial;
  public ctx;
  public paint_simple;
  public clickX_simple = [];
  public clickY_simple = [];
  public clickDrag_simple = [];
  public clickColor = [];
  public clickLineWidth = [];
  public canvas_simple;
  public context_simple;
  applyShadow = true;
  applyTransparent = false;
  countEdits:Number = 0;
  public canvasWidth = 236;
  public canvasHeight = 314;
  public colorBG = "rgb(255, 0, 0)";
  public colorFG = "rgb(0, 255, 0)";
  public colorChoosen = this.colorBG;
  totalScale = 0;
  pendingRequest = null; // for edit
  preversioResponseObj;
  public apiUrl;
  public apiProcessUrl;
  wrapperBGColor = "#fff";
  flagFirstTime:Number = 0;
  showResultImage = 'none';
  displayLoader = 'none';
  displayShowInstructions = 'none';
  undoDataUrl = [];
  undoImageStack = [];
  undoImageMaskStack = [];
  initDataUrl = [];
  undoEditResponse = [];
  go = [];
  maskUrl:String;
  pressTimer;
  public srcImageResult;
  public resultImageUrl;
  //  View_Result= "";
  editRequestSubject = new Subject();
  getSessionInfo = new Subject();
  flagShouldInitizlize = false;
  showProccessErrorMessageTitle = "";
  showProccessErrorMessage = "";
  public showProccessErrorWidth = 397;
  loaderImage;
  apiTrackId:string;
  progressPercent = 0;
  showEditorView = "none";
  transparentImageSrc = "";
  defaultSrcImageResult = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

  constructor(private elementRef:ElementRef, private cdr:ChangeDetectorRef, private showimageService:ShowimageService,
              private requestEditImage:RequestEditImage, private _dom:BrowserDomAdapter, private http:Http,
              private _ngZone:NgZone) {

    this.showWrapperShadow = true;

    this.transparentImageSrc = transparentImage;

    //  this.showimageService.resultEditMaskImageUrl = showimageService.resultImageUrl;
    this.obj = {
      "originalImageUrl": "data:image/gif;bas-e64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
      "resultEditMaskImageUrl": "data:image/gif;bas-e64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",

    };
    this.srcImageResult = this.defaultSrcImageResult;


    //    sessionId = 1;
    //  var url = url.substring(0, url.lastIndexOf("/") + 1);
    this.editRequestSubject
      .switchMap((c) => this.http.post(c.a, c.b, {headers: c.header}))
      .map((res:Response) => res.json())
      .subscribe(res => this.showEditResponse(res.response));


    this.getSessionInfo
      .switchMap((c) => this.http.post(c.url, c.b, {headers: c.headers}))
      .map((res:Response) => res.json())
      .subscribe(res => this.foundTrackId(res));

    window.camera51Edit = {
      zone: this._ngZone,
      doZoom: (value) => this.doZoom(value),
      doLongZoomPressDown: (value) => this.doLongZoomPressDown(value),
      doLongZoomPressUp: (value) => this.doLongZoomPressUp(value),
      setColor: (value) => this.setColor(value),
      showResult: () => this.showResult(),
      saveImage: () => this.saveImage(),
      undo: () => this.undoEdit(),
      initApp: (value) => this.initApp(value),
      setTrackId: (value) => this.setTrackId(value),
      setDataOriginalUrl: (value) => this.setDataOriginalUrl(value),
      component: this
    };

    this.setApiUrl(showimageService.apiUrl);
    //  this.initViewOnData();
    // this.calculateImageSize();
  }

  setApiUrl(apiUrl) {
    var lastChar = apiUrl.substr(-1); // Selects the last character
    if (lastChar != '/') {         // If the last character is not a slash
      apiUrl = apiUrl + '/';            // Append a slash to it.
    }
    this.apiProcessUrl = apiUrl + "Camera51Server/processImage";
    this.apiTrackId = apiUrl + "Camera51Server/retrieveSession";
  }

  initApp(obj) {
    this.showimageService.customerId = 0;
    this.showimageService.trackId = '';
    var newObj = JSON.parse(obj);
    this.setOutsideConfig(newObj);
    //  console.log(newObj, this.showimageService);
    if (this.showimageService.originalImageUrl != null &&
      this.showimageService.originalImageUrl.length > 0) {

      var sessionId = this.getSession(this.showimageService.originalImageUrl);
      //   console.log(sessionId);

      this.showimageService.resultImageUrl = this.resultImageUrl;
      this.sessionId = sessionId;

      this.initViewOnData(sessionId);
      return;
    }
    if (this.showimageService.trackId != null &&
      this.showimageService.trackId.length > 0) {

      this.runGetTracker(this.showimageService.customerId, this.showimageService.trackId);

    }


  }

  getSession(path) {
    var url = path.substring(0, path.lastIndexOf("/") + 1);

    var m = path.match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/)
    var fileName = (m === null) ? "" : m[0]
    var fileExt = (m === null) ? "" : m[1]
    this.maskUrl = url + m[1] + "_MASK_gen0.png";
    this.resultImageUrl = url + m[1] + "_RES.png";
    return url.substring(url.lastIndexOf("SID"), url.lastIndexOf("/"));
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


  setOutsideConfig(obj) {
    this.initDrawArrays(null);

    if (obj.apiUrl && obj.apiUrl.length > 1) {
      this.setApiUrl(obj.apiUrl);
    }
    this.showimageService.customerId = obj.customerId;
    if (obj.customerId && typeof obj.customerId === 'number') {
      this.showimageService.customerId = obj.customerId;
    }

    if (typeof obj.showWrapperShadow === 'boolean') {
      this.showWrapperShadow = obj.showWrapperShadow;
    }

    if (obj.wrappermarginTop == 0 || (obj.wrappermarginTop && typeof obj.wrappermarginTop === 'number')) {
      this.wrappermarginTop = obj.wrappermarginTop;
      this.showimageService.wrappermarginTop = obj.wrappermarginTop;
    }

    if (obj.decreaseInnerHeight && typeof obj.decreaseInnerHeight === 'number') {

      this.decreaseInnerHeight = obj.decreaseInnerHeight;
    }
    if (obj.trackId && typeof obj.trackId === 'string' && obj.trackId.length > 0) {
      this.showimageService.trackId = obj.trackId;
    }
    if (obj.originalImageUrl && typeof obj.originalImageUrl === 'string' && obj.originalImageUrl.length > 0) {
      this.showimageService.originalImageUrl = obj.originalImageUrl;
    }

    if (obj.backgroundColor && typeof obj.backgroundColor === 'string' && obj.backgroundColor.length > 0) {
      this.wrapperBGColor = obj.backgroundColor;
    }
  }

  private runGetTracker(customerId, trackId) {
    this.showResultImage = "none";
    this.maskHidden = false;
    this.flagShowResult = false;

    this.showEditorView = 'none';
    this.startLoader();

    this.initDrawArrays(null);
    this.undoDataUrl = [];
    this.undoEditResponse = [];
    if (customerId == '' || customerId == null) {
      return;
    }
    this.showimageService.customerId = customerId;

    c = {};
    var creds = {
      "trackId": trackId,
      "customerId": customerId
    };

    var credsa = this.param(creds);

    var c = {};
    c.url = this.apiTrackId;
    c.b = credsa;
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    c.headers = headers;
    this.getSessionInfo.next(c);
    return true;
  }

  setDataOriginalUrl(obj) {
    this.startLoader();
    this.clearCanvas_simple();
    var newObj = JSON.parse(obj);
    var customerId = newObj.customerId;
    var originalImageUrl = newObj.originalImageUrl;
    this.setOutsideConfig(newObj);
    if (originalImageUrl.length > 0) {
      var sessionId = this.getSession(originalImageUrl);
      // console.log(sessionId);
      this.showimageService.originalImageUrl = originalImageUrl;

      this.showimageService.resultImageUrl = this.resultImageUrl;
      this.sessionId = sessionId;
      //that.stopLoader();
      this.initViewOnData(sessionId);
      return;
    }

  }

  setTrackId(obj) {

    var newObj = JSON.parse(obj);
    var customerId = newObj.customerId;
    var trackId = newObj.trackId;
    this.setOutsideConfig(newObj);
    this.clearCanvas_simple();

    this.showimageService.customerId = customerId;
    this.showimageService.trackId = trackId;
    this.runGetTracker(this.showimageService.customerId, this.showimageService.trackId);
  }


  getImageDimensions(url) {
    var img = new Image();
    var that = this;
    img.onload = function () {
      var height = img.height;
      var width = img.width;
      //    console.log("hw" , height, width);
      // code here to use the dimensions
      that.obj.imageSize = {};
      that.obj.imageSize.height = height;//this.image1Element.nativeElement.naturalHeight;
      that.obj.imageSize.width = width;//this.image1Element.nativeElement.naturalWidth;

      that.calculateImageSize();
      that.showEditorView = 'block';
      var dataURL = that.canvasElement.nativeElement.toDataURL();
      that.undoDataUrl.push(dataURL);
      that.undoEditResponse.push(that.obj);

      TimerWrapper.setTimeout(function () {
        that.ctx.setTransform(1, 0, 0, 1, 0, 0);
        that.ctx.scale(that.totalScale, that.totalScale);
        //console.log("scale", that.totalScale);

      }, 200);

      //that.doZoom('out');

      //that.resetSize('up');that.resetSize('down');
    }
    img.src = url;
  }


  foundTrackId(foundTrackId) {
    var response;

    if (foundTrackId.response) {
      response = foundTrackId.response;
    } else {
      console.log("foundTrackId", foundTrackId.response);
      console.log('track id not found');
      this.stopLoader();
      return;
    }
    if (response.hasOwnProperty('errors')) {
      console.log('track id not found response: ', response.errors[0]);
      window.callbackEdit({'error': "trackerIdNotFound", "message": response.errors[0]});
      this.stopLoader();
      return;
    }

    var imageObj = new Image();
    var that = this;
    imageObj.onload = function () {
      that.showimageService.originalImageUrl = response.originalImageUrl;
      that.maskUrl = response.resultEditMaskImageUrl;
      that.showimageService.resultImageUrl = response.resultImageUrl;
      that.sessionId = response.sessionId;
      that.stopLoader();
      that.initViewOnData(that.sessionId);
      window.callbackEdit({'inEditMode': true});
    };

    var imageObjMask = new Image();
    imageObjMask.onload = function () {
      imageObj.src = response.originalImageUrl;
    };
    imageObjMask.src = response.resultEditMaskImageUrl;

  }

  initViewOnData(sessionId) {
    this.preversioResponseObj = {};

    if (sessionId == '' && this.showimageService.originalImageUrl.length > 1) {
      sessionId = this.getSession(this.showimageService.originalImageUrl);
    }
    if (sessionId == '') {
      return;
    }

    this.showimageService.resultEditMaskImageUrl = this.maskUrl;
    this.preversioResponseObj.resultEditMaskImageUrl = this.maskUrl;
    this.obj = {
      "originalImageUrl": this.showimageService.originalImageUrl,
      "resultImageUrl": this.showimageService.resultImageUrl,
      "resultEditMaskImageUrl": this.maskUrl,
      "sessionId": sessionId,
      "imageId": "1",
      "customerId": this.showimageService.customerId
    }
    this.srcImageResult = this.defaultSrcImageResult;
    this.applyShadow = this.showimageService.applyShadow;
    this.applyTransparent = this.showimageService.applyTransparent;

    this.showimageService = this.showimageService;
    this.showimageService.obj = this.obj;


    this.getImageDimensions(this.showimageService.originalImageUrl);
    //this.stopLoader();
    window.callbackEdit({'inEditMode': true});

  }


  create(value:string) {
    this.translate.get(value).subscribe(translatedValue => {
      this.showProccessErrorMessage = translatedValue;
    });

  }

  onMouseWheelModal(e) {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
  }

  onMouseWheel(e) {

    //console.log(e.deltaX,e.deltaY);
    //  e.preventDefault();
    //  e.stopImmediatePropagation();
    if (e.deltaY < 0) {

      this.doZoom('in');
    } else {
      this.doZoom('out');
    }

  }

  calculateImageSize() {
    this.totalZoomInitial = -2;
    this.canvasWidth = this.obj.imageSize.width;
    this.canvasHeight = this.obj.imageSize.height;
    //console.log(this.canvasHeight, this.canvasWidth);
    this.obj.origWidth = this.canvasWidth;
    this.obj.origHeight = this.canvasHeight;

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight - this.decreaseInnerHeight;
    //(window.innerHeight -240) * 0.9; // 80 + 50+60+50
    this.imageWrapperMaxHeight = windowHeight;
    //windowWidth = windowWidth.toPrecision(2);
    //    console.log(windowWidth, windowHeight);
    this.imagewrapperSizeWidth = this.obj.origWidth;
    var divide = 0;

    var divideHeight = this.obj.imageSize.height / windowHeight;
    var divideWidth = this.obj.origWidth / windowWidth;

    if ((windowHeight - this.obj.imageSize.height   ) < 0 || (windowWidth - this.obj.origWidth) < 0) {
      if (divideHeight > divideWidth) {
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

    if (divide > 0) {
      var numIn = 0;
      //  var divide = this.obj.origWidth / windowWidth;
      //var numIn = divide/ this.AMOUNT_ZOOM;
      //  console.log('numIn',numIn);
      //  var numIn = numIn.toPrecision(2);
      //  divide = numIn * this.AMOUNT_ZOOM;
      //   console.log('divide',divide);
      //  divide = Math.floor(divide);

      var a = 1 / divide;
      numIn = (1 - a) / this.AMOUNT_ZOOM;
      //    console.log('divide',divide,a);
      //       numIn = Math.floor(a);
      // divide = this.AMOUNT_ZOOM / numIn;

      divide = 1 - (this.AMOUNT_ZOOM * numIn);
      //     divide = 0.4;

      var newHeight = this.obj.origHeight * divide;
      var newWidth = this.obj.origWidth * divide;

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

    this.totalScale = 1 + (this.AMOUNT_ZOOM * this.totalZoom);
//      console.log("totalScale",this.totalScale);
  }

  undoEdit() {

    if (this.flagShowResult) {
      return;
    }
    window.ga('send', 'event', 'CLIENT', 'undo',"customerId="+this.showimageService.customerId +",sessionId="+this.sessionId);

    var undoDataUrl = this.undoDataUrl;
    if (undoDataUrl.length <= 1) {
      console.log("undoDataUrl is empty");
      return;
    }

    //  console.log(context);
    var image = undoDataUrl[undoDataUrl.length - 2];
    var imageMask = this.undoEditResponse[undoDataUrl.length - 2];

    this.undoImageStack.push(image);
    this.undoImageMaskStack.push(imageMask.resultEditMaskImageUrl);

    this.undoDataUrl.pop();
    this.undoEditResponse.pop();
    this.showimageService.lastDataUrl = image;
    this.clearCanvas_simple();
    this.showimageService.resultEditMaskImageUrl = imageMask.resultEditMaskImageUrl;
    this.preversioResponseObj = imageMask;

    this.initDrawArrays();
    this.redrawSimple();

    this.setImageToCanvas(image);
    //  console.log("undo", this.undoDataUrl);
  }

  setImageToCanvas(image) {
    var context = this.ctx;
    var that = this;
    var imageObj = new Image();
    imageObj.onload = function () {
      context.drawImage(this, 0, 0);
      //console.log("done setImageToCanvas");
      //console.log(that.canvasElement.nativeElement.toDataURL());
    };
    imageObj.src = image;
    this.ctx = context;
  }

  initDrawArrays(editFromPreviousOpenWindow) {

    if (editFromPreviousOpenWindow != null && typeof editFromPreviousOpenWindow === 'object') {
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

      this.preversioResponseObj.resultEditMaskImageUrl = this.showimageService.editedStuff.undoEditResponse[this.showimageService.editedStuff.undoEditResponse.length - 1].resultEditMaskImageUrl;
      this.showimageService.lastDataUrl = this.showimageService.editedStuff.undoDataUrl[this.showimageService.editedStuff.undoDataUrl.length - 1];
    } else {
      this.undoDataUrl = [];
      this.undoEditResponse = [];

      this.clickColor = [];
      this.clickX_simple = [];
      this.clickY_simple = [];
      this.clickDrag_simple = [];
      this.clickLineWidth = [];
      if (this.obj.hasOwnProperty('resultEditMaskImageUrl')) {
        this.preversioResponseObj = {}
        this.preversioResponseObj.resultEditMaskImageUrl = this.obj.resultEditMaskImageUrl;
      }
    }
  }

  clickInContainer() {
    if (this.flagFirstTime) {
      this.displayShowInstructions = "none";
    }
  }

  doLongZoomPressDown(type) {
    this.longPress = false;
    var that = this;
    window.ga('send', 'event', 'CLIENT', 'LongZoom'+type ,"customerId="+this.showimageService.customerId +",sessionId="+this.sessionId);

    var repeat = function () {
      that.doZoom(type);
      that.pressTimer = TimerWrapper.setTimeout(repeat, 100);
    }
    repeat();
  }

  doLongZoomPressUp(type) {
    TimerWrapper.clearTimeout(this.pressTimer);
  }

  doZoom(type) {

    var AMOUNT_ZOOM = this.AMOUNT_ZOOM;//0.09;
    var multiply = 0;
    var zoomW = 0;
    var zoomH = 0;
    //  console.log("totalZoomInitial", this.totalZoomInitial, this.totalZoom);

    if (this.totalZoomInitial >= this.totalZoom && type == 'out') {
      //alert("no more zoom out");
      return;
    }
    if (15 < this.totalZoom && type == 'in') {
      //alert("no more zoom out");
      return;
    }
    if (this.totalZoom > 0) {
      var t = 1 + (AMOUNT_ZOOM * this.totalZoom);
      this.ctx.scale(-t, -t);
    }
    if (this.totalZoom < 0) {
      var t = 1 - (AMOUNT_ZOOM * this.totalZoom);
      this.ctx.scale(-t, -t);
    }
    //console.log('t', -t);
    if (type == 'in') {
      if (this.totalZoom == 0) {
        this.totalZoom = 1;
      } else {
        this.totalZoom = this.totalZoom + 1;
      }
      var scale = 1 + (AMOUNT_ZOOM * this.totalZoom);
      var zoomW = this.obj.origWidth * scale;
      var zoomH = this.obj.origHeight * scale;
      if (this.totalZoom < 0) {

        var totalZoom = -this.totalZoom;
        scale = 1 - (AMOUNT_ZOOM * totalZoom);

        var zoomW = this.obj.origWidth * scale;
        var zoomH = this.obj.origHeight * scale;
        //      console.log('scale',scale);
      }

      this.ctx.canvas.width = zoomW;
      this.ctx.canvas.height = zoomH;
      this.ctx.scale(scale, scale);

    } else {
      // zoom out

      if (this.totalZoom == 0) {
        this.totalZoom = -1;
      } else {
        this.totalZoom = this.totalZoom - 1;
      }

      var scale = (1 + (AMOUNT_ZOOM * this.totalZoom));

      this.totalScale = scale;
      //console.log(this.totalZoom);
      var zoomW = this.obj.origWidth * scale;
      var zoomH = this.obj.origHeight * scale;

      if (this.totalZoom < 0) {

        var totalZoom = -this.totalZoom;
        scale = 1 - (AMOUNT_ZOOM * totalZoom);
        //scale = -scale;
        var zoomW = this.obj.origWidth * scale;
        var zoomH = this.obj.origHeight * scale;

        //    console.log('zoomH',zoomH);
      }
      this.ctx.canvas.width = zoomW;
      this.ctx.canvas.height = zoomH;
      this.ctx.scale(scale, scale);
      //    this.ctx.scale(-0.1,-0.1);
    }

    if (this.totalZoomInitial >= this.totalZoom) {
      this.imagewrapperOverflow = 'hidden';
    } else {
      this.imagewrapperOverflow = "auto";
    }
    this.imagewrapper.nativeElement.scrollLeft = (this.imagewrapper.nativeElement.scrollWidth - this.imagewrapper.nativeElement.clientWidth) / 2
    //this.imagewrapper.nativeElement.scrollHeight = ( this.imagewrapper.nativeElement.clientHeight) / 2

    //this.imagewrapper.nativeElement.overflow = 'auto';
    //    console.log(type,scale, zoomW, zoomH);
    //  console.log(this.totalZoom);
    var yMove = (zoomH - this.imagewrapperSizeheight);
    var xMove = (zoomW - this.imagewrapperSizeWidth);
    this.imagewrapperSizeWidth = zoomW;
    this.imagewrapperSizeheight = zoomH;

    this.imageSizeWidth = zoomW;
    this.imageSizeHeight = zoomH;
    this.redrawSimple();
    this.totalScale = 1 + (this.AMOUNT_ZOOM * this.totalZoom);

    if (this.wrappermarginTop > 0) {
      if (this.wrappermarginTop < (yMove / 2)) {
        this.wrappermarginTop = 0;
      } else {
        this.wrappermarginTop = this.wrappermarginTop - ( yMove / 2);
      }
    }
    if (yMove < 0 && window.innerHeight > this.imagewrapperSizeheight) {
      var x = (window.innerHeight - this.imagewrapperSizeheight);
      //console.log("x",x);
      if (x > this.showimageService.wrappermarginTop) {
        this.wrappermarginTop = this.showimageService.wrappermarginTop;
      }
    }
  }


  resetSize(direction) {
    var zoomH, zoomW;
    //console.log('resetSize totalZoom',this.totalZoom );
    if (this.totalZoom != 0) {
      if (direction == 'down') {
        zoomW = this.obj.origWidth;
        zoomH = this.obj.origHeight;
        this.ctx.canvas.width = zoomW;
        this.ctx.canvas.height = zoomH;

        this.imagewrapperSizeWidth = zoomW;
        this.imagewrapperSizeheight = zoomH;
        //  this.ctx.scale(-scale,-scale);
      } else {

        var scale = (this.AMOUNT_ZOOM * this.totalZoom);
        if (this.totalZoom < 0) {

          var totalZoom = -this.totalZoom;
          scale = 1 - (this.AMOUNT_ZOOM * totalZoom);
          zoomW = this.obj.origWidth * scale;
          zoomH = this.obj.origHeight * scale;
        } else {
          scale = 1 + scale;
          zoomW = this.obj.origWidth * scale;
          zoomH = this.obj.origHeight * scale;
        }
        this.ctx.canvas.width = zoomW;
        this.ctx.canvas.height = zoomH;

        this.imagewrapperSizeWidth = zoomW;
        this.imagewrapperSizeheight = zoomH;
        this.ctx.scale(scale, scale);
      }
    }
    //  console.log('reset',direction,zoomW,zoomH);
    this.imageSizeWidth = zoomW;
    this.imageSizeHeight = zoomH;
    this.redrawSimple();

  }

  getStyleBG() {

    if (this.isGreen == false) {
      return "url(" + this.assetsUrl + "'/assets/tools/background_chosen.png')";
    } else {
      //  this.colorBGElement.nativeElement.classList.add("fgChoosen");
      return "url(" + this.assetsUrl + "'/assets/tools/background_unchosen.png')";
    }
  }

  setBgButtonActive(flag) {
    if (this.colorBGElement == null) {
      return;
    }
    if (flag) {
      this.colorBGElement.nativeElement.classList.remove("bgUnChosen");
      this.colorBGElement.nativeElement.classList.add("bgChosen");
    } else {
      this.colorBGElement.nativeElement.classList.remove("bgChosen");
      this.colorBGElement.nativeElement.classList.add("bgUnChosen");
    }
  }

  setFgButtonActive(flag) {

    if (this.colorFGElement == null) {
      return;
    }
    if (flag) {
      this.colorFGElement.nativeElement.classList.remove("fgUnChosen");
      this.colorFGElement.nativeElement.classList.add("fgChosen");
    } else {
      this.colorFGElement.nativeElement.classList.remove("fgChosen");
      this.colorFGElement.nativeElement.classList.add("fgUnChosen");
    }
  }


  getStyleFG() {
    if (this.isGreen == false) {
      return "url(" + this.assetsUrl + "'/assets/tools/object_unchosen.png')";
    } else {
      return "url(" + this.assetsUrl + "'/assets/tools/object_chosen.png')";
    }
  }


  setImageScalingVariables() {

    var totalScale = 1 + (this.AMOUNT_ZOOM * this.totalZoom);
    if (totalScale > 0) {
      radius = 10 / totalScale;
    }
    if (this.totalScale < 0) {
      radius = -(10 * totalScale);
    }
  }

  addClickSimple(x, y, dragging) {
    var totalScale = this.totalScale;
    //    console.log(totalScale)
    //totalScale = 1;
    //    y = y -20;
    x = x + 3;
    y = y + 3;

    var radius = 4;
    if (totalScale > 0) {
      x = x / totalScale;
      y = y / totalScale;
      radius = radius / totalScale;
    }
    if (this.totalScale < 0) {
      x = -(x * totalScale);
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


  redrawSimple(redraw = false) {

    //console.log('in redrawSimple');
    this.clearCanvas_simple();
    //  var canvas = this.ctx;
    //  this.ctxTemp.globalAlpha = 0.5;
    //	this.ctx.strokeStyle = "#fff";
    this.ctx.lineJoin = "round";
    //  this.ctx.lineCap = 'round';
    //this.ctx.lineWidth = radius;
    if (this.showimageService.lastDataUrl.length > 1) {
      this.setImageToCanvas(this.showimageService.lastDataUrl);
    }


    for (var i = 0; i < this.clickX_simple.length; i++) {
      //console.log("inredraw");
      this.ctx.strokeStyle = this.clickColor[i];
      //      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.lineWidth = this.clickLineWidth[i];
      //  console.log('a');
      this.ctx.beginPath();
      if (this.clickDrag_simple[i] && i) {
        this.ctx.moveTo(this.clickX_simple[i - 1], this.clickY_simple[i - 1]);
      } else {
        this.ctx.moveTo(this.clickX_simple[i] - 1, this.clickY_simple[i]);
      }
      this.ctx.lineTo(this.clickX_simple[i], this.clickY_simple[i]);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    //    this.ctxTemp.drawImage(this.canvasElement.nativeElement, 0, 0);
  }

  clearCanvas_simple() {
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

  onMouseDown(e) {

    var mousePos = this.getMousePos(this.canvasElement.nativeElement, e);
    //  console.log(mousePos);
    this.paint_simple = true;

    this.addClickSimple(mousePos.x, mousePos.y, false);
    this.redrawSimple();
  }

  onMouseMove(e) {
    if (this.paint_simple) {
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

  onMouseUp(e) {
    this.paint_simple = false;
    //  this.redrawSimple();
    this.preformEditRequest();
  }

  onMouseLeave(e) {
    if (this.paint_simple == true) {
      this.preformEditRequest();
    }
    this.paint_simple = false;
  }

  setColor(chossen) {

    if (chossen == 'colorFG') {
      this.colorChoosen = this.colorFG;
      this.setFgButtonActive(true);
      this.setBgButtonActive(false);
    } else {
      this.setFgButtonActive(false);
      this.setBgButtonActive(true);
      this.colorChoosen = this.colorBG;
    }

    if (this.flagShowResult) {
      this.showResultImage = "none";
      this.maskHidden = false;
      window.callbackEdit({'returnFromShowResult': true});
      if (this.undoButton != null) {
        this.undoButton.nativeElement.classList.remove("undoDisabled");
        this.undoButton.nativeElement.removeAttribute("disabled", "disabled");
      }
      //this.colorBGElement.nativeElement.classList.add("bgUnChosen");
      this.flagShowResult = false;
    }

    this.isGreen = (chossen == 'colorFG') ? true : false;
    this.getStyleFG();
    this.getStyleBG();
    this.colorBGElement.classMap;
  }

  backToEdit() {
    window.callbackEdit({'returnFromShowResult': true});
    this.setColor('colorBG');
  }

  // do matting
  showResult() {
    //console.log("showResult");
    if (this.flagShowResult) {
      this.backToEdit();
      return false;
    }
    window.ga('send', 'event', 'CLIENT', 'showResult',"customerId="+this.showimageService.customerId +",sessionId="+this.sessionId);

    var dataURL = this.canvasElement.nativeElement.toDataURL();

    this.setFgButtonActive(false);
    this.setBgButtonActive(false);
    if (this.undoButton != null) {
      this.undoButton.nativeElement.classList.add("undoDisabled");
      this.undoButton.nativeElement.setAttribute("disabled", "disabled");
    }

    this.runMatting();
    return false;
  }


  runMatting(isSaveRequest) {
    //  console.log(this.showimageService);
    var dataURL = this.canvasElement.nativeElement.toDataURL();
    this.displayLoader = 'block';
    this.loaderImage = this.assetsUrl + "/assets/tools/malabiloader.gif";
    this.startLoader();
    this.requestEditImage.search(dataURL,
      this.obj.originalImageUrl,
      this.obj.imageId,
      this.obj.customerId,
      this.obj.sessionId,
      this.apiProcessUrl,
      this.showimageService.resultEditMaskImageUrl,
      true,
      this.applyShadow,
      this.showimageService.applyTransparent, isSaveRequest
    ).subscribe(a => this.showResultResponse(a.response, isSaveRequest));
    this.startLoader();
  }

  startLoader() {
    window.callbackEdit({'loader': true});
    this.width = 0;
    this.progressPercent = 30;

    this.timeProgress = TimerWrapper.setInterval(frame, 1);
    var that = this;

    function frame() {
      //console.log("A");
      if (that.progressPercent >= 100) {
        //  TimerWrapper.clearInterval(that.timeProgress);
        that.progressPercent = 0;
      } else {
        that.progressPercent + 20;
      }
    }
  }

  stopLoader() {
    window.callbackEdit({'loader': false});
    if (this.progressPercent > 0)
      TimerWrapper.clearInterval(this.timeProgress);
    this.progressPercent = 0;
  }


  // after matting
  showResultResponse(ob, isSaveRequest) {
    //  console.log(ob);
    var that = this;
    var image = new Image();
    image.onload = function () {
      that.displayLoader = 'none';
      that.loaderImage = this.assetsUrl + "/assets/tools/smallloader.gif";
      that.stopLoader();
      that.srcImageResult = this.src;
      that.resultImageUrl = this.src;
      that.showResultImage = 'block';
      that.maskHidden = true;
      that.flagShowResult = true;
      that.View_Result = "EDIT_PAGE_BACK_TO_EDIT_BUTTON";
      if (isSaveRequest) {
        that.openResultWindow();
      } else {
        window.callbackEdit({'callbackInShowResult': true});

      }
    }
    image.src = ob.resultImageUrl;
  }

  openResultWindow() {
    //    console.log("openResultWindow",this.resultImageUrl);
    this.showimageService.resultUrl = this.resultImageUrl;

    if (this.undoEditResponse.length <= 1) {
      //  this.undoEditResponse = [];
      //  this.undoDataUrl = [];
    }

    this.showimageService.editedStuff = {
      'clickColor': this.clickColor,
      'clickX_simple': this.clickX_simple,
      'clickY_simple': this.clickY_simple,
      'clickDrag_simple': this.clickDrag_simple,
      'clickLineWidth': this.clickLineWidth,
      'undoDataUrl': this.undoDataUrl,
      'undoEditResponse': this.undoEditResponse
    }
    window.callbackEdit({'url': this.resultImageUrl});
    // this.dialog.close('openResult');
  }


  preformEditRequest() {
    var dataURL = this.canvasElement.nativeElement.toDataURL();
    if (this.totalZoom != 0) {
      this.resetSize('down');
      dataURL = this.canvasElement.nativeElement.toDataURL();
      this.resetSize('up');
    }
    //console.log(dataURL);
    this.disableShowResult = true;
    this.disableSaveImage = true;
    this.disableUndoButton = true;

    if (this.isGreen == true) {
      this.disableColorBG = true;

    } else {
      this.disableColorFG = true;
    }
    this.displayLoader = 'block';
    this.loaderImage = this.assetsUrl + "/assets/tools/malabiloader.gif";
    this.startLoader();
    var creds = {
      "origImgUrl": this.obj.originalImageUrl,
      "imageId": this.obj.imageId,
      "sessionId": this.obj.sessionId,

      "customerId": this.obj.customerId,
      "doMatting": false,
      "previousMaskURL": this.preversioResponseObj.resultEditMaskImageUrl,
      "shadow": this.applyShadow,
      "transparent": this.showimageService.applyTransparent,
      "userInputImageData": dataURL
    };

    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    var credsa = this.param(creds);

    this.dataURL = dataURL;
    this.editRequestSubject.next({a: this.apiProcessUrl, b: credsa, header: headers});

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
  showEditResponse(a) {
    //console.log(a);
    this.undoDataUrl.push(this.dataURL);
    this.undoEditResponse.push(a);
    this.undoImageStack.push(this.dataURL);

    this.countEdits++;
    this.displayLoader = 'none';
    this.loaderImage = this.assetsUrl + "/assets/tools/smallloader.gif";
    //this.stopLoader();
    // was stop loader
    window.callbackEdit({'inEditMode': true});
    this.disableShowResult = false;
    this.disableSaveImage = false;
    this.disableUndoButton = false;

    if (this.isGreen == true) {
      this.disableColorBG = false;

    } else {
      this.disableColorFG = false;
    }
    if (a.resultEditMaskImageUrl) {
      this.preversioResponseObj = a;
      //document.getElementById('image2Element').src = a.resultEditMaskImageUrl;
      this.showimageService.resultEditMaskImageUrl = a.resultEditMaskImageUrl;
      this.undoImageMaskStack.push(a.resultEditMaskImageUrl);
    }
  }

  showInstructions() {
    this.displayShowInstructions = 'block';
  }

  ngAfterViewInit() {
    this.ctx = this.canvasElement.nativeElement.getContext("2d");
    this.ctx.scale(this.totalScale, this.totalScale);
    if (this.flagShouldInitizlize == true) {
      var dataURL = this.canvasElement.nativeElement.toDataURL();
      this.undoDataUrl.push(dataURL);
      this.undoEditResponse.push(this.obj);
    }
  }

  ngOnChanges() {
//        console.log("changes",document.getElementById('image1Element').offsetWidth);
  }

  ngOnInit() {
    // we need to detach the change detector initially, to prevent a
    // "changed after checked" error.
    var that = this;
    window.onresize = function () {
      that.cdr.detectChanges();
      //that.cdr.detach();
      that.calculateImageSize();
      //  console.log("resize");
      that.redrawSimple();
    };
  }

  beforeDismiss():boolean {
    return true;
  }

  closeWindow(type) {
    if (this.countEdits > 0) {
      var i;
      for (i = 0; i < this.countEdits; i++) {
        this.undoEdit();
        //console.log('undo ' + this.countEdits);
      }
      this.lastDataUrl = '';
    }

    this.countEdits = 0;

    if (this.initDataUrl.length > 0) {
      //console.log(this.initDataUrl);
      this.showimageService.editedStuff.undoDataUrl = this.initDataUrl;
      this.showimageService.editedStuff.undoEditResponse = this.initEditResponse.slice();
      this.showimageService.resultEditMaskImageUrl = this.showimageService.editedStuff.undoEditResponse[this.showimageService.editedStuff.undoEditResponse.length - 1].resultEditMaskImageUrl;
    }
    //    this.dialog.close(false);
  }

  saveImage() {
    window.ga('send', 'event', 'CLIENT', 'saveImage',"customerId="+this.showimageService.customerId +",sessionId="+this.sessionId);

    //  if (this.flagShowResult == false) {
      this.runMatting(true);
  //    return false;
   // }
   // this.openResultWindow();

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
