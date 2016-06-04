
var camera51;
function initCamera51(obj) {
 camera51 = new camera51obj(obj);
}

function camera51obj(obj){
  var apiUrl = "";
  var iframeSrc = "";
  if(obj.hasOwnProperty('apiUrl') && obj.apiUrl.length > 1){
    apiUrl = obj.apiUrl;
  } else {
    apiUrl = "//sandbox.malabi.co";
  }
  if(obj.hasOwnProperty('iframeSrc') && obj.iframeSrc.length > 1){
    iframeSrc = obj.iframeSrc;
  } else {
    console.log("please place iframeSrc in your initCamera51 function");
    return;
  }

  this.camera51HelperextractDomain = function(url) {
      var domain;
      if (url.indexOf("://") > -1) {
          var domain1 = url.split('/')[0];
          var domain2 = url.split('/')[2];
          domain = domain1 + "//" + domain2;
      }
      else {
          var url = window.location.href
          var arr = url.split("/");
          domain = arr[0] + "//" + arr[2]
      }
      return domain;
  }

  var frameDomain = this.camera51HelperextractDomain(iframeSrc);

	var iframe = document.createElement('iframe');
  this.obj = obj;

  var element =  document.getElementById('camera51Frame');
  if (typeof(element) != 'undefined' && element != null)
  {
    // exists
  } else {
    this.obj.callBackStartLoader()
    iframe.frameBorder=0;
    iframe.width="100%";
    iframe.height="100%";
    iframe.id="camera51Frame";
    iframe.setAttribute("src", iframeSrc);
    iframe.style = "border:0;"
    document.getElementById(obj.elementId).appendChild(iframe);
  }
  var unsandboxedFrame;
  var _this = this;
  iframe.addEventListener("load", function() {
    unsandboxedFrame = document.getElementById('camera51Frame');
    _this.obj.callBackStopLoader();
    if(_this.obj.hasOwnProperty('apiUrl') ){
      unsandboxedFrame.contentWindow.postMessage({'initCamera51':JSON.stringify(obj)},frameDomain);
    }
    if(_this.obj.hasOwnProperty('backgroundColor') ){
      unsandboxedFrame.contentWindow.postMessage({'backgroundColor':_this.obj.backgroundColor},frameDomain);
    }

  });
  this.setDataOriginalUrl = function(obj){
   
    unsandboxedFrame.contentWindow.postMessage({'customerId':obj.customerId,  'originalImageUrl': obj.originalImageUrl,'objInJsonString':JSON.stringify(obj)}, frameDomain);
    return true;
  }
  this.setDataTrackId = function(obj){
   
    unsandboxedFrame.contentWindow.postMessage({'customerId':obj.customerId,  'trackId': obj.trackId,'objInJsonString':JSON.stringify(obj)}, frameDomain);
    return true;
  }
  this.setData = function(obj){ // old function renamed, for CL
    if(this.obj.hasOwnProperty('showWrapperShadow')){
      obj.showWrapperShadow = this.obj.showWrapperShadow;
    }
    if(this.obj.hasOwnProperty('decreaseInnerHeight')){
      obj.decreaseInnerHeight = this.obj.decreaseInnerHeight;
    }
    if(this.obj.hasOwnProperty('backgroundColor')){
      obj.backgroundColor = this.obj.backgroundColor;
    }
    unsandboxedFrame.contentWindow.postMessage({'customerId':obj.customerId,  'trackId': obj.trackId,'objInJsonString':JSON.stringify(obj)}, frameDomain);
    return true;
  }

  this.setColor = function(code){
    unsandboxedFrame.contentWindow.postMessage('setColor_'+code, frameDomain);
    return 1;
  }
  this.showResult = function(code){
    unsandboxedFrame.contentWindow.postMessage('showResult', frameDomain);
    return 1;
  }
  this.saveImage = function(code){

    unsandboxedFrame.contentWindow.postMessage('saveImage', frameDomain);
    return 1;
  }
  this.zoomIn = function(code){
    unsandboxedFrame.contentWindow.postMessage('zoomIn', frameDomain);
    return 1;
  }
  this.zoomOut = function(code){
    unsandboxedFrame.contentWindow.postMessage('zoomOut', frameDomain);
    return 1;
  }
  this.onclickLongZoomIn = function(code){
    unsandboxedFrame.contentWindow.postMessage('onclickLongZoomIn', frameDomain);
    return 1;
  }
  this.onmouseupLongZoomIn = function(code){
    unsandboxedFrame.contentWindow.postMessage('onmouseupLongZoomIn', frameDomain);
    return 1;
  }
  this.onclickLongZoomOut = function(code){
    unsandboxedFrame.contentWindow.postMessage('onclickLongZoomOut', frameDomain);
    return 1;
  }
  this.onmouseupLongZoomOut = function(code){
    unsandboxedFrame.contentWindow.postMessage('onmouseupLongZoomOut', frameDomain);
    return 1;
  }
  this.undo = function(code){
    unsandboxedFrame.contentWindow.postMessage('undo', frameDomain);
    return 1;
  }


  // Listen for response messages from the frames.
  window.addEventListener('message', function (e) {
    if (e.origin !== frameDomain)
      return;
      var data = e.data;

      if(e.data == false){
         camera51.obj.callBackFuncClose(e.data);
      }
      if(e.data == 'back'){
         camera51.obj.callBackFuncBack(e.data);
      }
      if(e.data.hasOwnProperty('url') && data.url.length > 5){
        camera51.obj.callBackFuncSave(data.url);
      }
      if(e.data.hasOwnProperty('loader') ){
        if(data.loader == true){
          camera51.obj.callBackStartLoader();
        }
        if(data.loader == false){
          camera51.obj.callBackStopLoader();
        }
      }
      if(e.data.hasOwnProperty('error') ){
          camera51.obj.callBackError(data);
      }
  });
}
