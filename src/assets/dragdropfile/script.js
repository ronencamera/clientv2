

var apiUrl = "http://api.malabi.co";

var customerId = null;
var customerToken = null;

window.onbeforeunload = function() {
  var numItems = $('.eachImage').length;
  if(numItems >0){
    return "Data will be lost if you leave the page, are you sure?";
  }

};

$(document).ready(function () {


  $("#select-all").click(function(){
    $(".camera51-select-image").prop('checked', true);
  });
  $("#delete-selected").click(function(){
    $("input:checkbox:checked").each(function(){
      $(this).closest('.eachImage').remove();
    });

  });
  $("#download-selected").click(function(){
    $("input:checkbox:checked").each(function(){
      var imgSrc = $(this).closest('.eachImage').find(".resultPreview").find('img').attr('src');
      if(imgSrc != undefined){
        download(imgSrc);
      }

    });
  });

  camera51WithQueue.callbackAsyncRequestError = function(mes){
    $('#show-token-error').openModal();
    $('#errorSubject').html("callbackAsyncRequestError");
    $('#errorMessage').html(mes);
  };

  camera51WithQueue.callbackNewSQSRequestError = function(mes){
    $('#show-token-error').openModal();
    $('#errorSubject').html("callbackNewSQSRequestError");
    $('#errorMessage').html("Error in creating SQS, please contact info@malabi.co <br> <br> error " + mes);
  };



  function getCamera51SessionToken(){
    var cookieForSession = "camera51.sessionToken";
    if(camera51WithQueue.getCookie(cookieForSession)){
      sessionToken = camera51WithQueue.getCookie(cookieForSession);
      sessionTokenReady(sessionToken);
    }
    if(customerToken == null){
      $('#show-token-error').openModal();
      $('#errorSubject').html("Missing token");
      $('#errorMessage').html("Token is missing, please contact info@malabi.co");
      return;
    }

    var settings = {
      "async": false,
      "url": apiUrl  + "Camera51Server/getSessionToken",
      "method": "POST",
      "headers": {
        "content-type": "application/x-www-form-urlencoded"
      },
      "data": {
        "token": customerToken,
        "customerId": customerId,
      }
    };

    $.ajax(settings).done(function (response) {
      sessionToken = response.response["sessionToken"];
      var date = new Date();
      date.setTime(date.getTime() + (60 * 60 * 1000));
      document.cookie =
        cookieForSession +'=' + sessionToken +
        '; expires=' + date.toUTCString() +
        '; path=/';
      sessionTokenReady(sessionToken);
    });
  }

  var dropbox;
  var _URL = window.URL;
  var oprand = {
    dragClass: "active",
    maxFiles: 30,
    on: {
      load: function (e, file) {
        // check file type
        var imageType = /image.*/;
        if (!file.type.match(imageType)) {
          alert("File \"" + file.name + "\" is not a valid image file");
          return false;
        }
        // check file size
        if (parseInt(file.size / 1024) > 6050) {
          alert("File \"" + file.name + "\" is too big.Max allowed size is 2 MB.");
          return false;
        }

        var img = new Image();

        img.onload = function () {
  //        console.log("Width:" + this.width + "   Height: " + this.height);//this will give you image width and height and you can easily validate here....
          var s = {w: this.width, h: this.height};
          create_box(e, file, s);
        };
        img.src = _URL.createObjectURL(file);
      },
      showerrors: function (msg) {
      //  $('#show-token-error').show();
        $('#show-token-error').openModal();
        $('#errorSubject').html("Images were not uploaded");
        $('#errorMessage').html("You may upload a MAXIMUM of 30 images at a time");
      }
    }
  };

  try {
    FileReaderJS.setupDrop(document.body, oprand);
  } catch (e){
    console.log(e);
  }
});


create_box = function (e, file, size) {
  var loader = '<div class="preloader-wrapper">'
    +'<div class="spinner-layer spinner-red-only">'
    +'<div class="circle-clipper left">'
    +'<div class="circle"></div>'
    +'</div><div class="gap-patch">'
    +'<div class="circle"></div>'
    +'</div><div class="circle-clipper right">'
    +'<div class="circle"></div>'
    +'</div></div></div>';
  var rand = Math.floor((Math.random() * 100000) + 3);
  var imgName = file.name; // not used, Irand just in case if user wanrand to print it.
  var src = e.target.result;

  var template = '<div class="eachImage z-depth-1" id="eachImage-' + rand + '">';
  template += '<div class="save-option"><input type="checkbox" class="camera51-select-image filled-in" id="filled-in-box-' + rand + '"  /> ' +
    '<label for="filled-in-box-' + rand + '" style="color: white">Select</label> <i style="font-size: initial;color: white;cursor: pointer !important;" title="remove" class="material-icons right" onclick="$(this).closest(\'.eachImage\').remove();">close</i></div>';
  template += '<span class="preview" id="' + rand + '"><img src="' + src + '"><span class="overlay"><span class="updone"></span></span>';
  template += '</span>';
//	template += '<div class="progress" id="'+rand+'"><span></span></div>';
  var x ;
  var height = (200/size.h);// * test.h;
  var width = (180/size.w);// * test.w;
  if(height < width){
    x = height;
  } else {
    x = width;
  }
  size.hPro = size.h *x;
  size.wPro = size.w *x;
  template += '<div class="resultPreview" id="resultPreview-' + rand +
      '" style="width:100%;height:250px;" id="'
      + rand + '"><div>' + loader + '</div></div>';

  if ($("#imageList .eachImage").html() == null)
    $("#imageList").html(template);
  else
    $("#imageList").append(template);

  // upload image
  upload(file, rand);
}

upload = function (file, rand) {

  var _this = this;
  var formData = new FormData();
  formData.append('file', file);

  // now upload the file
  var xhr = new Array();
  xhr[rand] = new XMLHttpRequest();
  xhr[rand].open("post", apiUrl + "/Camera51Server/uploadimage", true);
  xhr[rand].upload.addEventListener("progress", function (event) {
    //console.log(event);
    if (event.lengthComputable) {
      $(".progress[id='" + rand + "'] span").css("width", (event.loaded / event.total) * 100 + "%");
      $(".preview[id='" + rand + "'] .updone").html(((event.loaded / event.total) * 100).toFixed(2) + "%");
    }
    else {
      alert("Failed to compute file upload length");
    }
  }, false);

  xhr[rand].ontimeout = function (e) {
    // XMLHttpRequest timed out. Do something here.
    console.error(e);
  };

  xhr[rand].onreadystatechange = function (oEvent) {
    if (xhr[rand].readyState === 4) {
      if (xhr[rand].status === 200) {
        $(".progress[id='" + rand + "'] span").css("width", "100%");
        $(".preview[id='" + rand + "']").find(".updone").html("100%");
        $(".preview[id='" + rand + "'] .overlay").css("display", "none");
        try{

          data = JSON.parse(xhr[rand].responseText);

        } catch (e){
     //     console.log(e);
     //     console.log(xhr[rand]);
     //     console.log("done", xhr[rand].response);
          _this.upload(file, rand);
          return false;
        }
        requestImage(rand, data.uploadUrl);

      } else {
        _this.upload(file, rand);
        return false;
        console.error(xhr[rand]);
      }
    }
  };

  xhr[rand].send(formData);

};

var get_params = function(search_string) {

  var parse = function(params, pairs) {
    var pair = pairs[0];
    var parts = pair.split('=');
    var key = decodeURIComponent(parts[0]);
    var value = decodeURIComponent(parts.slice(1).join('='));

    // Handle multiple parameters of the same name
    if (typeof params[key] === "undefined") {
      params[key] = value;
    } else {
      params[key] = [].concat(params[key], value);
    }

    return pairs.length == 1 ? params : parse(params, pairs.slice(1))
  };

  // Get rid of leading ?
  return search_string.length == 0 ? {} : parse({}, search_string.substr(1).split('&'));
};


var params = get_params(location.search);

if(params.customerId && params.token){
  customerId = params.customerId;
  customerSessionToken = params.token;
} else {

  $('#show-token-error').openModal();
  $('#errorSubject').html("Missing token");
  $('#errorMessage').html("Token is missing, please contact info@malabi.co");
}

function download(img) {
  var link = document.createElement("a");
  link.href = img;
  link.download = true;
  link.type = 'image/jpg';
  link.style.display = "none";
  var evt = new MouseEvent("click", {
    "view": window,
    "bubbles": true,
    "cancelable": true
  });

  document.body.appendChild(link);
  link.dispatchEvent(evt);
  document.body.removeChild(link);
  console.log("Downloading...");
}

