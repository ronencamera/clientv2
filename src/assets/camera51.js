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
    this.obj.callbackStartLoader();
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
    _this.obj.callbackStopLoader(_this.obj.RETURN_IFRAME);
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

    if(e.data == false && camera51.obj.hasOwnProperty('callbackFuncClose')) {
       camera51.obj.callbackFuncClose(e.data);
    }
    if(e.data == 'back' && camera51.obj.hasOwnProperty('callbackFuncBack')) {
       camera51.obj.callbackFuncBack(e.data);
    }
    if(e.data.hasOwnProperty('url') && data.url.length > 5 && camera51.obj.hasOwnProperty('callbackFuncSave')) {
      camera51.obj.callbackFuncSave(data.url);
    }
    if(e.data.hasOwnProperty('loader') && camera51.obj.hasOwnProperty('callbackStartLoader')) {
      if(data.loader == true){
        camera51.obj.callbackStartLoader();
      }
      if(data.loader == false){
        camera51.obj.callbackStopLoader(this.RETURN_EDITOR);
      }
    }
    if(e.data.hasOwnProperty('error') && camera51.obj.hasOwnProperty('callbackError')) {
        camera51.obj.callbackError(data);
        camera51.obj.callbackStopLoader();
    }
    if(e.data.hasOwnProperty('returnFromShowResult') && camera51.obj.hasOwnProperty('returnFromShowResult')) {
        camera51.obj.returnFromShowResult();
        camera51.obj.callbackEnableUndo();
    }
    if(e.data.hasOwnProperty('inEditMode') && camera51.obj.hasOwnProperty('callbackInEditMode')) {
      camera51.obj.callbackStopLoader();
      camera51.obj.callbackEnableButtons();
      camera51.obj.callbackInEditMode();
    }
    if(e.data.hasOwnProperty('callbackInShowResult') && camera51.obj.hasOwnProperty('callbackInShowResult')) {
        camera51.obj.callbackInShowResult();
        camera51.obj.callbackStopLoader();
        camera51.obj.callbackEnableButtons();
        camera51.obj.callbackDisableUndo();
    }
  });
}
