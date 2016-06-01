
var camera51;
function initCamera51(obj) {
 camera51 = new camera51obj(obj);
}

function camera51obj(obj){
  var iframeSrc = "http://crazylister.s3-website-us-east-1.amazonaws.com/index.html"
  if(obj.hasOwnProperty('iframeSrc') && obj.iframeSrc.length > 1){
    iframeSrc = obj.iframeSrc;
  }
  var frameDomain = camera51HelperextractDomain(iframeSrc);

	var iframe = document.createElement('iframe');
  this.obj = obj;
  this.setData = function(code){
    unsandboxedFrame.contentWindow.postMessage({'height': 2,'customerId':obj.customerId,  'trackId': obj.trackId}, '*');
    return true;
  }
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
    if(obj.trackId !== ''){
      _this.setData(obj);
      return true;
    }

  });

  this.setData = function(obj){
    unsandboxedFrame.contentWindow.postMessage({'height': 2,'customerId':obj.customerId,  'trackId': obj.trackId}, '*');
    return true;
  }

  this.setColor = function(code){
    unsandboxedFrame.contentWindow.postMessage('setColor_'+code, '*');
    return 1;
  }
  this.showResult = function(code){
    unsandboxedFrame.contentWindow.postMessage('showResult', '*');
    return 1;
  }
  this.saveImage = function(code){

    unsandboxedFrame.contentWindow.postMessage('saveImage', '*');
    return 1;
  }
  this.zoomIn = function(code){
    unsandboxedFrame.contentWindow.postMessage('zoomIn', '*');
    return 1;
  }
  this.zoomOut = function(code){
    unsandboxedFrame.contentWindow.postMessage('zoomOut', '*');
    return 1;
  }
  this.onclickLongZoomIn = function(code){
    unsandboxedFrame.contentWindow.postMessage('onclickLongZoomIn', '*');
    return 1;
  }
  this.onmouseupLongZoomIn = function(code){
    unsandboxedFrame.contentWindow.postMessage('onmouseupLongZoomIn', '*');
    return 1;
  }
  this.onclickLongZoomOut = function(code){
    unsandboxedFrame.contentWindow.postMessage('onclickLongZoomOut', '*');
    return 1;
  }
  this.onmouseupLongZoomOut = function(code){
    unsandboxedFrame.contentWindow.postMessage('onmouseupLongZoomOut', '*');
    return 1;
  }
  this.undo = function(code){
    unsandboxedFrame.contentWindow.postMessage('undo', '*');
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

function camera51HelperextractDomain(url) {
    var domain;

    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[0];
        domain2 = url.split('/')[2];
        domain = domain + "//" + domain2;
    }
    else {
        domain = url.split('/')[0];
        var url = window.location.href
        var arr = url.split("/");
      domain = arr[0] + "//" + arr[2]

    }

    //find & remove port number
    //domain = domain.split(':')[0];
    return domain;
}
