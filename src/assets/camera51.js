// Version 1.0

var camera51; // Object for Interacting with the editor.
var camera51UserFunctions = new Camera51UserFunctions(); // Object, functions for registering analytics events.

// TODO: This func should be removed.
function camera51Selected(imgUrl, customerId) {
  var sess = function getSession(url){
    var re = /(SID_.*)\//;
    var n = url.match(re);
    if(n == undefined){
      return null;
    } else {
      return n[1];
    }
  }

  var session = sess(imgUrl);
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "https://www.google-analytics.com/collect?", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("v=1&tid=UA-75726540-1&cid="+customerId+"&t=event&ec=CLIENT&ea=SelectedImageFromCustomer&el=customerId="+customerId+",sesssionId="+session);
}

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

  if (obj.hasOwnProperty('apiUrl') && obj.apiUrl.length > 1) {
    apiUrl = obj.apiUrl;
  } else {
    apiUrl = "//sandbox.malabi.co";
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

  var element =  document.getElementById('camera51Frame');
  if (element == null || typeof(element) == 'undefined') {   // If iframe doesn't exist, create it.
    this.obj.callBackStartLoader();
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
    _this.obj.callBackStopLoader(_this.obj.RETURN_IFRAME);
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

  this.setDataTrackId = function(obj) {
    unsandboxedFrame.contentWindow.postMessage({'customerId':obj.customerId,  'trackId': obj.trackId,'objInJsonString':JSON.stringify(obj)}, frameDomain);
    return true;
  };

  // TODO: This func should be removed.
  this.setData = function(obj){ // old function renamed, for CL

    if(this.obj.hasOwnProperty('showWrapperShadow')){
      obj.showWrapperShadow = this.obj.showWrapperShadow;
    }
    if(this.obj.hasOwnProperty('decreaseInnerHeight')){
      obj.decreaseInnerHeight = this.obj.decreaseInnerHeight;
    }
    if(this.obj.hasOwnProperty('wrappermarginTop')){
      obj.wrappermarginTop = this.obj.wrappermarginTop;
    }
    if(this.obj.hasOwnProperty('backgroundColor')){
      obj.backgroundColor = this.obj.backgroundColor;
    }
    obj.customerId = this.obj.customerId;
    unsandboxedFrame.contentWindow.postMessage({'setData':1,'objInJsonString':JSON.stringify(obj)}, frameDomain);
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

  // Listen for response messages from the frames.
  window.addEventListener('message', function (e) {
    if (e.origin !== frameDomain)
      return;
    var data = e.data;

    if(e.data == false && camera51.obj.hasOwnProperty('callBackFuncClose')) {
       camera51.obj.callBackFuncClose(e.data);
    }
    if(e.data == 'back' && camera51.obj.hasOwnProperty('callBackFuncBack')) {
       camera51.obj.callBackFuncBack(e.data);
    }
    if(e.data.hasOwnProperty('url') && data.url.length > 5 && camera51.obj.hasOwnProperty('callBackFuncSave')) {
      camera51.obj.callBackFuncSave(data.url);
    }
    if(e.data.hasOwnProperty('loader') && camera51.obj.hasOwnProperty('callBackStartLoader')) {
      if(data.loader == true){
        camera51.obj.callBackStartLoader();
      }
      if(data.loader == false){
        camera51.obj.callBackStopLoader(this.RETURN_EDITOR);
      }
    }
    if(e.data.hasOwnProperty('error') && camera51.obj.hasOwnProperty('callBackError')) {
        camera51.obj.callBackError(data);
        camera51.obj.callBackStopLoader();
    }
    if(e.data.hasOwnProperty('returnFromShowResult') && camera51.obj.hasOwnProperty('returnFromShowResult')) {
        camera51.obj.returnFromShowResult();
        camera51.obj.callbackEnableUndo();
    }
    if(e.data.hasOwnProperty('inEditMode') && camera51.obj.hasOwnProperty('callbackInEditMode')) {
      camera51.obj.callBackStopLoader();
      camera51.obj.callbackEnableButtons();
      camera51.obj.callbackInEditMode();
    }
    if(e.data.hasOwnProperty('callbackInShowResult') && camera51.obj.hasOwnProperty('callbackInShowResult')) {
        camera51.obj.callbackInShowResult();
        camera51.obj.callBackStopLoader();
        camera51.obj.callbackEnableButtons();
        camera51.obj.callbackDisableUndo();
    }
  });
}
