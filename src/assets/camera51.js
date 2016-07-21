// Version 1.0

var camera51; // Object for Interacting with the editor.
var camera51UserFunctions = new Camera51UserFunctions(); // Object, functions for registering analytics events.
var camera51WithQueue = new Camera51WithQueue();

var camera51Text = {
  "show-result"     : "show result",
  "back-to-edit"    : "back to edit",
  "tooltip-mark-background" : "Draw lines to mark areas you want to remove from the image",
  "tooltip-mark-object" : "Draw lines to mark areas you want to keep in the image",

  "error-header-default": "Press here for manual background removal",
  "error-header-image-failure": "Image error",
  "error-text-5" : "We didn't automaticaly remove the background since the image <b>already has a white background</b>",
  "error-text-2" : "We didn't automaticaly remove the background due to <b>low contrast</b>",
  "error-text-4" : "We didn't automaticaly remove the background due to <b>cluttered background</b>",
  "error-text-103" : "The image is <b>too small</b> for background removal.",
  "error-text-101" : "An image error was detected. Image can not be proccessed",
};



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
  this.camera51Text = camera51Text;

  if (obj.hasOwnProperty('apiUrl') && obj.apiUrl.length > 1) {
    apiUrl = obj.apiUrl;
  } else {
    apiUrl = "//api.malabi.co";
  }

  if (obj.hasOwnProperty('camera51Text')) {
    this.camera51Text = Object.assign(this.camera51Text, obj.camera51Text);
  }

  this.apiUrl = apiUrl;

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

  this.getApiUrl = function () {
    return this.apiUrl;
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

  this.setAttributeText = function(atr, str){
    if(document.getElementById(atr)) {
      var buttonShowresult = document.getElementById(atr);
      buttonShowresult.innerText = str;
    }
  };

  this.setEitorText = function(){
    var _this = this;
    var listElement = {'camera51-btn-show-result': "show-result",
                        'camera51-btn-save-image':'save-image'
                      };

    Object.keys(listElement).forEach(function(key) {
      if(this.camera51Text.hasOwnProperty(listElement[key])){
        console.log(this.camera51Text[listElement[key]]);
        _this.setAttributeText(key, this.camera51Text[listElement[key]]);

      };
      //this.setAttributeText(key)
      console.log(key, listElement[key]);

    });
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

  this.initilizeView = function(){
    if(document.getElementById("camera51-btn-show-result")) {
      var buttonShowresult = document.getElementById("camera51-btn-show-result");
      buttonShowresult.innerText = this.camera51Text['show-result'];
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
    _this.setEitorText();
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
    _this.initilizeView();
    if(responseOnSave){
      this.responseOnSave = responseOnSave;
    } else {
      this.responseOnSave = null;
    }
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
     // console.log(_this.obj);
      if(camera51.obj.hasOwnProperty('callbackFuncSave')){
        camera51.obj.callbackFuncSave(data.url, _this.responseOnSave);
      } else {
        if(typeof _this.responseOnSave === 'function' ){
          _this.responseOnSave(data.url);
        } else {
          console.error("No function to run on save. Implment 'callbackFuncSave', recieves url.");
        }
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
        return;
      }
      if(document.getElementById("camera51-btn-show-result")) {
        var buttonShowresult = document.getElementById("camera51-btn-show-result");
        buttonShowresult.innerText = this.camera51Text['show-result'];
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
      if(document.getElementById("camera51-btn-show-result")) {
        var buttonShowresult = document.getElementById("camera51-btn-show-result");
        buttonShowresult.innerText = this.camera51Text['back-to-edit'];
      }
    }
  });


}


function Camera51WithQueue(){
  //var apiUrl = "http://sandbox.malabi.co/Camera51Server/processImageAsync";

  var searchFor = "sessionId";
  var searchArray = [];
  var arrayElements = [];
  var sqsUrl = "";
  this.apiUrl = null;
  this.customerId = null;
  this.sessionToken = null;
  this.sqsRunning = false;
  this.requestStopSQSrequests = false;
  this.camera51Text = camera51Text;

  this.init = function(obj){
    this.customerId = obj.customerId;
    this.sessionToken = obj.sessionToken;
    this.camera51Text = obj.camera51Text;
    /*if(obj.hasOwnProperty("textOverride")){
      this.te
    }*/
    initCamera51({
      elementId: obj.camera51EditorIframe, // Div to insert the iframe.
      apiUrl: apiUrl,
      customerId: obj.customerId,
      camera51Text: obj.camera51Text
      //
    });
    this.apiUrl = camera51.apiUrl;
    this.setSQSurl(true);
  };

  this.loaded = function () {


  };

  this.addSearchArray = function(ele, str){
    searchArray.push(str);
    arrayElements.push(ele);

    //Camera51SQSFunctionality.checkUpdatesSQS();
  };

  this.getSearchArray = function(){
    return searchArray;
  };

  this.startSQS = function(){
    if(this.sqsRunning == false){
      this.checkUpdatesSQS();
    }
  }

  this.checkUpdatesSQS = function(){
    var callbackURL = this.sqsUrl+"?Action=ReceiveMessage&VisibilityTimeout=10";
    var _this = this;

    if(arrayElements.length == 0){
      this.sqsRunning = false;
      return;
    }
    this.sqsRunning = true;

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
           // console.log(res);
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
    if ( typeof this.showImageCallbackOverride === 'function' ) {
      this.showImageCallbackOverride(elem, img , processingResultCode, trackId);
    } else {
      this.showImageCallback(elem, img , processingResultCode, trackId);
    }
  };

  // Can be overridden. using camera51.showImageCallbackOverride
  this.showImageCallback = function(elem, imgUrl , processingResultCode, trackId){
    if (processingResultCode == 0) {
      //console.log(imgUrl);
      var img = document.createElement('img');
      img.src = imgUrl;
      img.id = "theImg-" + elem.id;
      img.style.width = "100%";
      img.style.height = "auto";
      img.onclick =  function () {
        openEditor(trackId,elem.id);
      };
      //'openEditor("' + trackId + '","' + elem.id + '")';
      elem.innerHTML = null;
      elem.appendChild(img);

                                           // Append the text to <p>

    }
    if (processingResultCode > 0) {
    //  $(elem).html('error ' + processingResultCode);
      elem.innerHTML = null;
      var header = document.createElement('div');

      if(processingResultCode > 5){
        header.innerHTML = camera51Text['error-header-image-failure'];
        header.className = "error-header-image-failure";
      } else {
        header.innerHTML = camera51Text['error-header-default'];
        header.className = "error-header-default";
      }

      elem.appendChild(header);
      var header = document.createElement('div');
      var str = "error-text-"+ processingResultCode;
      header.innerHTML = camera51Text[str];
      header.className = "camera51-error-text";
      elem.appendChild(header);
    }

    if (processingResultCode <= 5) {
      //  $(elem).html('error ' + processingResultCode);
      var btn = document.createElement('a');
      btn.innerHTML = "TOUCH UP";
      btn.onclick =  function () {
        openEditor(trackId,elem.id);
      };
      btn.className = "btn";
      elem.appendChild(btn);

      //  elem.innerHTML = 'error ' + processingResultCode;
    }
  }

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
    xhttp.open("GET", this.sqsUrl+"?Action=DeleteMessage&ReceiptHandle="+encodeURIComponent(receiptHandle), true);
    xhttp.send();
  };

  this.getCookie=  function (cname)
  {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length,c.length);
      }
    }
    return null;
  };

  this.getSQSurl = function(){
    if(this.sqsUrl == null){
      return this.setSQSurl(false);
    }
    return this.sqsUrl;
  }


  this.setSQSurl = function(sync){

    var _this = this;
    var queueStringIdentifier = "camera51.sqsUrl";
    var sqsUrl = null;
    if(this.getCookie(queueStringIdentifier)){
      sqsUrl = this.getCookie(queueStringIdentifier);
      this.sqsUrl = sqsUrl;
      return sqsUrl;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        var res = JSON.parse(xhttp.responseText);
        sqsUrl = res.response["queueURL"];
        if(sqsUrl == undefined || sqsUrl.length < 10){
          try {
            var errorM = res.response.errors;
            console.error("Error", errorM[0]);
            alert("Camera51 error: "+errorM[0]);
          } catch (er){
            console.error(er);
          }

          return;
        }
        var date = new Date();
        var days = 1000 * 60 * 60 * 24 * 10;
        date.setTime(date.getTime() + days);
        document.cookie =
          queueStringIdentifier +'=' + sqsUrl +
          '; expires=' + date.toUTCString() +
          '; path=/';

        _this.sqsUrl = sqsUrl;
        return sqsUrl;
      }
    };

    xhttp.open("POST", this.apiUrl  + "Camera51Server/createQueue", (sync==null)? true: sync);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("token="+this.sessionToken+"&customerId="+this.customerId);

  };

  this.requestAsync = function(origImgUrl, element, uniqueTrackId){
    var _this = this;
    if(uniqueTrackId == null || uniqueTrackId == ""){
      uniqueTrackId = this.sessionToken+"-"+Date.now()+"-"+Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        try{
          var res = JSON.parse(xhttp.responseText);
          _this.addSearchArray(element, res.response.sessionId);
          _this.startSQS();
        } catch(err) {
          console.error(err);
        }
      }
    };
    xhttp.open("POST", apiUrl + "Camera51Server/processImageAsync", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("token="+this.sessionToken+"&customerId="+this.customerId+"&trackId="+uniqueTrackId
        +"&origImgUrl="+origImgUrl+"&callbackURL="+this.getSQSurl());
  };

  this.loaded();
};
