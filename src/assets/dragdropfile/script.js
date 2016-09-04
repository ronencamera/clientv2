
//var apiUrl = "http://sandbox-lb-1845392311.us-east-1.elb.amazonaws.com";
//var apiUrl = "http://prod-elb-577420654.us-east-1.elb.amazonaws.com";
var apiUrl = "http://api.malabi.co";

var customerId = null;
var customerToken = null;

// remove if no image left
function updateRemoveImage() {
  setTimeout(function () {
    var numItems = $('.eachImage').length;
    if (numItems == 0) {
      $("#download-images-wrapper").css('visibility', 'hidden');
    }
  }, 100);
}

$(document).bind("contextmenu",function(e){
  e.preventDefault()
});


$(window).bind('beforeunload', function(){
  var numItems = $('.eachImage').length;
  if(numItems >0){
    return "Data will be lost if you leave the page, are you sure?";
  }
});




$(document).ready(function () {
  $("#select-all").click(function(){
    $(".camera51-select-image").prop('checked', true);
  });
  $("#delete-selected").click(function(){
    $("input:checkbox:checked").each(function(){
      $(this).closest('.eachImage').remove();
    });

  });
  $("#download-images").click(function(){
    $(".eachImage").each(function(){
      var imgSrc = $(this).find(".resultPreview").find('img').attr('src');
      var imgE = $(this).find(".resultPreview").find('img');
      if(imgSrc != undefined){
        //download(imgSrc);
        $(imgE).addClass("downloadMeDownload");
      }
    });
    $(".downloadMeDownload").multiDownload();


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

  var MAX_FILES_TO_UPLOAD = 30;
  var dropbox;
  var _URL = window.URL;
  var oprand = {
    dragClass: "active",
    maxFiles: MAX_FILES_TO_UPLOAD,
    on: {
      load: function (e, file) {
        // check file type
        var imageType = /image.*/;
        if (!file.type.match(imageType)) {
          alert("File \"" + file.name + "\" is not a valid image file");
          return false;
        }
        // check file size
        if (parseInt(file.size / 1024) > 18050) {
          alert("File \"" + file.name + "\" is too big.Max allowed size is 6 MB.");
          return false;
        }

        var numItems = $('.eachImage').length;
        if(numItems > MAX_FILES_TO_UPLOAD){
          $('#show-token-error').openModal();
          $('#errorSubject').html("Images were not uploaded");
          $('#errorMessage').html("You may upload a MAXIMUM of "+MAX_FILES_TO_UPLOAD+" images");
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
        $('#errorMessage').html("You may upload a MAXIMUM of "+MAX_FILES_TO_UPLOAD+" images");
      }
    }
  };

  try {
    var droptarget  = document.getElementById('droptarget');
    FileReaderJS.setupDrop(droptarget, oprand);
    FileReaderJS.setupInput(document.getElementById('file-input'), oprand);
  } catch (e){
    console.log(e);
  }

  $('#imageList').on('DOMNodeInserted', function(e) {
    var numItems = $('.eachImage').length;
    if(numItems > 0){
      $("#download-images-wrapper").css('visibility','visible');
    }

    if($(e.target).find('.btn-touchup').length != 0){
      var a =   $(e.target).find('.btn-touchup');
      $(a).addClass("waves-effect waves-teal btn-flat ");
    }
  });

  $('#fileupload-btn').on('click', function () {
    $('#file-input').trigger('click');
  });
  $('#dropbox').on('click', function () {
    $('#file-input').trigger('click');
  });

  (function($, window, document, undefined) {
    "use strict"

    var download = function (options) {
      var triggerDelay = (options && options.delay) || 100;
      var cleaningDelay = (options && options.cleaningDelay) || 1000;

      this.each(function (index, item) {
        createIFrame(item, index * triggerDelay, cleaningDelay);
      });

      return this;
    };

    var createIFrame = function (item, triggerDelay, cleaningDelay) {
      setTimeout(function () {
        var frame = $('<iframe style="display: none;" class="multi-download-frame"></iframe>');
        frame.attr('src', $(item).attr('href') || $(item).attr('src'));
        $(item).after(frame);

        setTimeout(function () {
          frame.remove();
          $( item ).parents(".eachImage").remove();
          if($('.eachImage').length == 0){
            $("#download-images-wrapper").css('visibility','hidden');
          }

        }, cleaningDelay);

      }, triggerDelay);
    };

    $.fn.multiDownload = function(options) {
      return download.call(this, options)
    }

  })(jQuery, window, document);

});

create_box = function (e, file, size) {
  var loader = '<div class="preloader-wrapper">'
    +'<div class="spinner-layer " style="border-color:#77c2df ">'
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

  var template = '<div class="eachImage z-depth-1" id="eachImage-' + rand + '">';
  template += '<div class="save-option" onclick="updateRemoveImage()" >' +
    '<i id="save-option" style="cursor: pointer !important;" title="remove" class="material-icons right" onclick="$(this).closest(\'.eachImage\').remove();">close</i></div>';
  template += '<div class="preview" id="' + rand + '" ><span class="camera51-darken"><img src="' + src + '" style="opacity: 0.6"></span><span class="overlay"><div class="progress" id="'+rand+'"><div class="determinate" style="width: 70%"></div></div>';
  template += '<div style="font-size: 14px;color: white; ">Uploading...</div></span>';
  template += '</div><div style="height: 20px;width: 100%"></div> ';
	//template += '<div class="progress" id="'+rand+'"><div class="determinate" style="width: 70%"></div></div>';


  //$(".preview[id='" + rand + "'] img").css("opacity","0.6");

  template += '<div class="resultPreview" id="resultPreview-' + rand +
      '" style="width:100%;height:200px;" id="'
      + rand + '"><div style="top: 70px;position: relative;">' + loader + '</div></div>';

  if ($("#imageList .eachImage").html() == null)
    $("#imageList").html(template);
  else
    $("#imageList").append(template);

  // upload image
  upload(file, rand);
};

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
   //   console.log((event.loaded / event.total) * 100);
     // $(".progress[id='" + rand + "'] .determinate").parent(img).css()
      $(".progress[id='" + rand + "'] .determinate").css("width", (event.loaded / event.total) * 100 + "%");
   //   $(".preview[id='" + rand + "'] .updone").html(((event.loaded / event.total) * 100).toFixed(2) + "%");
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
        $(".progress[id='" + rand + "'] .determinate").css("width", "100%");
        $(".preview[id='" + rand + "'] img").css("opacity","1");
        $(".preview[id='" + rand + "'] .camera51-darken").css("background","transparent");
        $(".preview[id='" + rand + "'] .camera51-darken").css("opacity","1");
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


/*function downloadCam(img) {
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
}*/

$(document).ready(function () {
  document.addEventListener("dragstart", function(event) {

    // Change the opacity of the draggable element
    event.target.style.opacity = "0.4";
  });

  // While dragging the p element, change the color of the output text
  document.addEventListener("drag", function(event) {
    //      document.getElementById("demo").style.color = "red";
  });

  // Output some text when finished dragging the p element and reset the opacity
  document.addEventListener("dragend", function(event) {
    //    document.getElementById("demo").innerHTML = "Finished dragging the p element.";
    //    event.target.style.opacity = "1";


  });


  /* Events fired on the drop target */

  // When the draggable p element enters the droptarget, change the DIVS's border style
  document.addEventListener("dragenter", function(event) {

    $('.droptarget').css('display','block');

    if ( event.target.className == "droptarget" ) {
      //event.target.style.border = "3px dotted red";

      $('.dropImagePopup').css('visibility','visible');
    }
  });
  var obj = document.getElementById("droptarget");
  obj.addEventListener("drop", function(event) {
      $('.droptarget').css('display','none');
  });


  // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
  document.addEventListener("dragover", function(event) {
    event.preventDefault();
  });

  // When the draggable p element leaves the droptarget, reset the DIVS's border style
  document.addEventListener("dragleave", function(event) {

    if ( event.target.className == "droptarget" ) {
      event.target.style.border = "";
      //    that.visible = false;
     // that.displayNone = true;
      $('.droptarget').css('display','none');

    }
  });
});
