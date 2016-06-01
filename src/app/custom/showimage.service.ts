import {Injectable} from "@angular/core";

@Injectable();
export class ShowimageService{

  img1:string = "";
  img2:string = "";
  lastDataUrl:string = "";
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
  resultEditMaskImageUrl:string;
  resultUrl:string;
  showimageService:boolean;
  
}
