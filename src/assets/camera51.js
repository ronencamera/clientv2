
var camera51;
function initCamera51(obj) {
 camera51 = new camera51obj(obj);

}

function camera51obj(obj){
 
	var link = "index.html"
	var iframe = document.createElement('iframe');

  this.setData = function(code){
    unsandboxedFrame.contentWindow.postMessage({'height': 2,'customerId':obj.customerId,  'trackId': obj.trackId}, '*');
    return true;
  }
  var element =  document.getElementById('camera51Frame');
  if (typeof(element) != 'undefined' && element != null)
  {
    // exists
  } else {
    iframe.frameBorder=0;
    iframe.width="100%";
    iframe.height="100%";
    iframe.id="camera51Frame";
    iframe.setAttribute("src", link);
    iframe.style = "border:0;"
    document.getElementById(obj.elementId).appendChild(iframe);
  }
  var unsandboxedFrame;
  var _this = this;
  iframe.addEventListener("load", function() {
    unsandboxedFrame = document.getElementById('camera51Frame');
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
  	
     if ( (e.origin === (window.location.protocol + "//" + window.location.host)
            && e.source === unsandboxedFrame.contentWindow)) {
      var data = e.data;
      if(e.data == false){
         obj.callBackFuncClose(e.data);
      }
      if(e.data == 'back'){
         obj.callBackFuncBack(e.data);
      }
      if(data.url > 5){
         obj.callBackFuncSave(e.data);
      }
    }
  });


}
 