import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './Environment/envfile';
import { Observable } from 'rxjs';
// import { environment } from '../Environment/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseURL:string=environment.baseurl;

  constructor(private http:HttpClient) { }

   public mainContent(obj: any): Observable<any> {
    let Url = `${this.baseURL}/Input/getJobID`;
    return this.http.post(Url, obj)
  }
}


