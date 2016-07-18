// Version 1.0

var camera51; // Object for Interacting with the editor.
var camera51UserFunctions = new Camera51UserFunctions(); // Object, functions for registering analytics events.

function Camera51UserFunctions(){};

Camera51UserFunctions.prototype.sendEventTrackId = function(trackId, customerId,type) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", window.location.protocol +"//api.malabi.co/Camera51Server/imageUsed?", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("customerId="+customerId+"&trackId="+trackId+"&type="+type);
};

Camera51UserFunctions.prototype.sendEventResultImage = function(resultImageUrl, customerId,type) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", window.location.protocol +"//api.malabi.co/Camera51Server/imageUsed?", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("customerId="+customerId+"&resultImageUrl="+resultImageUrl+"&type="+type);
};

function initCamera51(obj) {
 camera51 = new camera51obj(obj);
}

function camera51obj(obj) {
  obj.RETURN_IFRAME = 1;
  obj.RETURN_EDITOR = 2;
  var apiUrl = "";
  var iframeSrc = "";
  var trackId = null;
  var imageElement = null;


  if (obj.hasOwnProperty('apiUrl') && obj.apiUrl.length > 1) {
    apiUrl = obj.apiUrl;
  } else {
    apiUrl = "//api.malabi.co";
  }

  if (obj.hasOwnProperty('iframeSrc') && obj.iframeSrc.length > 1) {
    iframeSrc = obj.iframeSrc;
  } else {
    iframeSrc = window.location.protocol+"//assets-malabi.s3.amazonaws.com/version/v1/index.html";
    // For development, if working in local host, use local iframe file:
    if (document.location.hostname == "localhost") {
      iframeSrc ="index.html";
    }
  }

  // For development, make API calls to local host - for Camera51 internal use only.
  if (window.location.search.indexOf('camera51api=local') > -1) {
    console.log("camera51api=localhost8080");
    obj.apiUrl = "http://localhost:8080";
  }

  if (!obj.hasOwnProperty('elementId')){
    console.log('Camera51 Error: Please specify elementId');
    return;
  } else {
    if (document.getElementById(obj.elementId) == null){
      console.log('Camera51 Error: Cannot find elementId in dom '+ obj.elementId);
      return;
    }
  }

  this.uclass = {
    exists: function(elem,className){var p = new RegExp('(^| )'+className+'( |$)');return (elem.className && elem.className.match(p));},
    add: function(elem,className){
      if(this.exists(elem,className)){return true;}elem.className += ' '+className;},
    remove: function(elem,className){var c = elem.className;var p = new RegExp('(^| )'+className+'( |$)');c = c.replace(p,' ').replace(/  /g,' ');elem.className = c;}
  };

  this.camera51HelperExtractDomain = function(url) {
    var regExp = /\/\/(.[^/]+)/;
    var domain = url.match(regExp);
    if(domain == undefined){
      var urlString = window.location.href;
      var arr = urlString.split("/");
      domain = arr[0] + "//" + arr[2];
      return domain;
    } else {
      return window.location.protocol + "//" + domain[1];
    }
  };

  var frameDomain = this.camera51HelperExtractDomain(iframeSrc);
	var iframe = document.createElement('iframe');
  this.obj = obj;

  this.startLoader = function(){
    this.disableButtons();
    if(this.obj.hasOwnProperty('callbackStartLoader')){
      this.obj.callbackStartLoader();
    } else {
      if(document.getElementById("camera51-loader")){
        document.getElementById('camera51-loader').style.visibility = "";
      } else {
        console.error("Error Camera51 Init: Loader element not found, looking for #camera51-loader element. Or add your override with your own callbackStartLoader function.");
      }
    }
  };

  this.stopLoader = function(type){
    if(this.obj.hasOwnProperty('callbackStopLoader')){
      this.obj.callbackStopLoader(type);
    } else {
      if(document.getElementById("camera51-loader")){
        document.getElementById('camera51-loader').style.visibility = "hidden";
      } else {
        console.error("Error Camera51 Init: Loader element not found, looking for #camera51-loader element. Or add your override with your own callbackStopLoader function.");
      }
    }
  };

  this.enableButtons = function(){
    if(this.obj.hasOwnProperty('callbackEnableButtons')){
      this.obj.callbackEnableButtons();
    } else {
      var elms = document.querySelectorAll('*[id^="camera51-btn"]');
      for (i=0;i<elms.length;i++) {
        this.uclass.remove(elms[i],'disabled');
      }
    }
  };

  this.disableButtons = function(){
    if(this.obj.hasOwnProperty('callbackEnableButtons')){
      this.obj.callbackEnableButtons();
    } else {
      var elms = document.querySelectorAll('*[id^="camera51-btn"]');
      for (i=0;i<elms.length;i++) {
        this.uclass.add(elms[i],'disabled');
      }
    }
  };

  this.disableUndo = function(){
    if(this.obj.hasOwnProperty('callbackDisableUndo')){
      this.obj.callbackDisableUndo();
    } else {
      if(document.getElementById("camera51-btn-undo")){
        var elm= document.getElementById("camera51-btn-undo");
        this.uclass.add(elm,'disabled');
      } else {
        console.error("Error Camera51 Init: camera51-btn-undo element not found, looking for #camera51-btn-undo element. Or add your override with your own callbackStopLoader function.");
      }
    }
  };

  var element =  document.getElementById('camera51Frame');
  if (element == null || typeof(element) == 'undefined') {   // If iframe doesn't exist, create it.
    this.startLoader();

    iframe.frameBorder=0;
    iframe.width="100%";
    iframe.height="100%";
    iframe.id="camera51Frame";
    iframe.setAttribute("src", iframeSrc);
    iframe.style = "border:0;";
    document.getElementById(obj.elementId).appendChild(iframe);
  }

  var unsandboxedFrame;
  var _this = this;

  iframe.addEventListener("load", function() {
    unsandboxedFrame = document.getElementById('camera51Frame');
    _this.stopLoader(_this.obj.RETURN_IFRAME);
    if(_this.obj.hasOwnProperty('apiUrl')) {
      unsandboxedFrame.contentWindow.postMessage({'initCamera51':JSON.stringify(obj)},frameDomain);
    }
    if(_this.obj.hasOwnProperty('backgroundColor')) {
      unsandboxedFrame.contentWindow.postMessage({'backgroundColor':_this.obj.backgroundColor},frameDomain);
    }
  });

  this.setDataOriginalUrl = function(obj) {

    unsandboxedFrame.contentWindow.postMessage({'customerId':obj.customerId,  'originalImageUrl': obj.originalImageUrl,'objInJsonString':JSON.stringify(obj)}, frameDomain);
    return true;
  };

  this.setDataTrackId = function(obj, responseOnSave) {

    if(responseOnSave){
      console.log(responseOnSave);
      this.responseOnSave = responseOnSave;
    }

   // Object.assign(obj, this.obj);

    unsandboxedFrame.contentWindow.postMessage({'customerId':obj.customerId,  'trackId': obj.trackId,'objInJsonString':JSON.stringify(obj)}, frameDomain);
    return true;
  };

  this.setColor = function(code) {
    unsandboxedFrame.contentWindow.postMessage('setColor_'+code, frameDomain);
    return 1;
  };

  this.showResult = function(code) {
    unsandboxedFrame.contentWindow.postMessage('showResult', frameDomain);
    return 1;
  };

  this.saveImage = function(code) {
    unsandboxedFrame.contentWindow.postMessage('saveImage', frameDomain);
    return 1;
  };

  this.zoomIn = function(code) {
    unsandboxedFrame.contentWindow.postMessage('zoomIn', frameDomain);
    return 1;
  };

  this.zoomOut = function(code) {
    unsandboxedFrame.contentWindow.postMessage('zoomOut', frameDomain);
    return 1;
  };

  this.onclickLongZoomIn = function(code) {
    unsandboxedFrame.contentWindow.postMessage('onclickLongZoomIn', frameDomain);
    return 1;
  };

  this.onmouseupLongZoomIn = function(code) {
    unsandboxedFrame.contentWindow.postMessage('onmouseupLongZoomIn', frameDomain);
    return 1;
  };

  this.onclickLongZoomOut = function(code) {
    unsandboxedFrame.contentWindow.postMessage('onclickLongZoomOut', frameDomain);
    return 1;
  };

  this.onmouseupLongZoomOut = function(code) {
    unsandboxedFrame.contentWindow.postMessage('onmouseupLongZoomOut', frameDomain);
    return 1;
  };

  this.undo = function(code) {
    unsandboxedFrame.contentWindow.postMessage('undo', frameDomain);
    return 1;
  };

  this.selectedImage = function(url) {
    console.log(url, _this);
  };

  var _this = this;
  // Listen for response messages from the frames.
  window.addEventListener('message', function (e) {
    if (e.origin !== frameDomain)
      return;
    var data = e.data;

    if(e.data == false ) {
      console.log("callbackFuncClose");
    //   camera51.obj.callbackFuncClose(e.data);
    }
    if(e.data.hasOwnProperty('url') && data.url.length > 5 ){
      _this.enableButtons();
      console.log(_this.obj);
      if(camera51.obj.hasOwnProperty('callbackFuncSave')){
        camera51.obj.callbackFuncSave(data.url, _this.responseOnSave);
      } else {
        // if function run
      //  _this.elementIdToResponse(data.url);
      }
    }
    if(e.data.hasOwnProperty('loader') ) {
      if(data.loader == true){
        _this.startLoader();
      }
      if(data.loader == false){
        _this.stopLoader(this.RETURN_EDITOR);
      }
    }
    if(e.data.hasOwnProperty('error')) {
      console.error(data);
      _this.stopLoader();
    }
    if(e.data.hasOwnProperty('returnFromShowResult')) {
      if(camera51.obj.hasOwnProperty('returnFromShowResult')){
        camera51.obj.returnFromShowResult();
      }
      _this.enableButtons();
    }
    if(e.data.hasOwnProperty('inEditMode') ) {
      _this.stopLoader();
      _this.enableButtons();
      if(camera51.obj.hasOwnProperty('callbackInEditMode')){
        camera51.obj.callbackInEditMode();
      }
    }
    if(e.data.hasOwnProperty('callbackInShowResult')) {
      if(camera51.obj.hasOwnProperty('callbackInShowResult')){
        camera51.obj.callbackInShowResult();
      }
      _this.stopLoader();
      _this.enableButtons();
      _this.disableUndo();
    }
  });


}


function Camera51ShowImage(){
  //var apiUrl = "http://sandbox.malabi.co/Camera51Server/processImageAsync";
  var callbackURL = sqsUrl+"?Action=ReceiveMessage&MaxNumberOfMessages=10&VisibilityTimeout=10";
  var searchFor = "trackId";
  var searchArray = [];
  var arrayElements = [];

  this.addSearchArray = function(ele, str){
    searchArray.push(str);
    arrayElements.push(ele);
  };

  this.getSearchArray = function(){
    return searchArray;
  };

  this.checkUpdatesSQS = function () {
    var callbackURL = sqsUrl+"?Action=ReceiveMessage&VisibilityTimeout=10";

    var _this = this;

    var xhr = new XMLHttpRequest();
    xhr.timeout = 90000;
    xhr.open('GET', callbackURL);
    xhr.onreadystatechange = function(){

    };
    xhr.onload = function() {

      if (xhr.status === 0) {
        if (xhr.statusText === 'abort') {

          // Has been aborted
        } else {
          // Offline mode
        }

      }
      if(this.readyState ===4) {
        if (this.status == 200) {
          var xmlDoc = xhr.responseXML;
          x = xmlDoc.getElementsByTagName("ReceiveMessageResponse")[0];

          x = x.getElementsByTagName("ReceiveMessageResult")[0];
          var res = _this.readMessages(x,searchFor );
          if(res != null){
            console.log(res);
            _this.showResponse(res);
          }
          _this.checkUpdatesSQS();
        } else {
          console.log("Error", xmlhttp.statusText);
          _this.checkUpdatesSQS();
        }
      }
    };
    xhr.onerror = function () {

    };
    xhr.send();
  };

  this.showResponse = function(response_element){
    var img = null;
    var trackId = null;
    var processingResultCode = null;
    var res = JSON.parse(response_element.messageBody);
    var elem = response_element.arrayElement;
    if( typeof res.ResultImage === 'string'){
      img = res.ResultImage;
    }
    if( typeof res.ProcessingResult === 'number'){
      processingResultCode = res.ProcessingResult;
    }
    if( typeof res.trackId === 'string'){
      trackId = res.trackId;
    }
    if ( typeof window['malabiShowImageCallback'] === 'function' ) { window['malabiShowImageCallback'](elem, img , processingResultCode, trackId); }

  };


  this.readMessages = function(messages, searchKey){

    var message = null;
    var messageBody = null;
    var lengthMessages = messages.getElementsByTagName("Message").length
    for(i=0; i < lengthMessages; i++){
      message = messages.getElementsByTagName("Message")[i];
      messageBody = message.getElementsByTagName("Body")[0].textContent;
      //  console.log(messageBody);
      var obj = JSON.parse(messageBody);

      var searchValue;
      for(searchValue in searchArray){
        //     console.log(obj[searchKey], searchArray[searchValue]);
        if(obj[searchKey] == searchArray[searchValue]){
          searchArray.splice(searchValue, 1);
          var arrayElement = arrayElements[searchValue]
          arrayElements.splice(searchValue, 1);
          this.deleteMessage(message);
          return {'messageBody': messageBody, 'arrayElement': arrayElement};
        }
      }
    }
    return null;
  };
  this.parseResponse = function(messageBody){
  }

  this.deleteMessage = function(message){
    var receiptHandle = message.getElementsByTagName("ReceiptHandle")[0].textContent;
    //console.log(encodeURIComponent(receiptHandle));
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
      }
    };
    xhttp.open("GET", sqsUrl+"?Action=DeleteMessage&ReceiptHandle="+encodeURIComponent(receiptHandle), true);
    xhttp.send();
  };

  this.getCookie=  function (name)
  {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
  };
};
