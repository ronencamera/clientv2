import {Injectable} from "@angular/core";

@Injectable();
export class ShowimageService{

  img1 = "";
  img2 = "";
  lastDataUrl = "";
  native ;
  obj;
  originalImageUrl:string;
  resultImageUrl:string;
  imageSizeWidth;
  imageSizeHeight;
  customerId;
  apiUrl:string;
  applyShadow:boolean = true;
  applyTransparent:boolean = false;
  editedStuff;
  resultEditMaskImageUrl;
}
