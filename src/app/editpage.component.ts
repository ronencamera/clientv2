/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

import {Editoraa} from './custom/201/editor'

/*
 * Editpage Component
 * Top Level Component
 */
@Component({
  selector: 'editpage',
  pipes: [ ],
  providers: [ ],
  directives: [Editoraa  ],
  encapsulation: ViewEncapsulation.None,
  styles: [
  ],
  template: `
    <editor></editor>   
     `
})

export class Editpage {
 
  constructor(
    ) {

  }


}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */