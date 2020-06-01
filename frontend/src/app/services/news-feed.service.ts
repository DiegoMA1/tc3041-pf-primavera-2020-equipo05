import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
const endpoint = 'http://104.154.210.48:8080/api/newsFeed';


@Injectable({
  providedIn: 'root'
})
export class NewsFeedService {

  httpOptions = {
    headers: new HttpHeaders({
      'Access-Control-Allow-Origin': '*'
    })
  };
  constructor(private router: Router, private http: HttpClient) { }

  getFeed(){
    return this.http.get(endpoint);
  }

  postFeed(post: any){
    return this.http.post(endpoint, post);
  }
}
