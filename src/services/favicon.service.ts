import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FaviconService {

  constructor() { }
  changeFavicon(iconUrl: string) {
    let link: HTMLLinkElement = document.querySelector("link[rel*='icon']")!;
    if(link) {
      // if a favicon link exists, update its href
      link.href = iconUrl;
    } else {
      // If no favicon link exists, create one
      link = document.createElement('link');
      link.rel = 'icon';
      link.href = iconUrl;
      document.head.appendChild(link);
    }
  }
}
