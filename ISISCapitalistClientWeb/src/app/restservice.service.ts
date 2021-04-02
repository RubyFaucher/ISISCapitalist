import { Injectable } from "@angular/core";
import { World, Pallier, Product } from "./world";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ThrowStmt } from "@angular/compiler";

@Injectable({
  providedIn: "root",
})
export class RestserviceService {
  constructor(private http: HttpClient) {}

  server = "http://localhost:8080/";
  user = "";

  set setUser(val: string) {
    this.user = val;
  }
  get getUser(): string {
    return this.user;
  }

  getServer(): string {
    return this.server;
  }

  private handleError(error: any): Promise<any> {
    console.error("An error occurred", error);
    return Promise.reject(error.message || error);
  }
  getWorld(): Promise<World> {
    return this.http
      .get(this.server + "adventureisis/generic/world", {
        headers: this.setHeaders(this.user),
      })
      .toPromise()
      .catch(this.handleError);
  }

  private setHeaders(user: string): HttpHeaders {
    var headers = new HttpHeaders({ "X-User": user });
    return headers;
  }

  putManager(manager: Pallier): Promise<any> {
    return this.http
      .put(this.server + "adventureisis/generic/manager", manager, {
        headers: this.setHeaders(this.user),
      })
      .toPromise();
  }
  putUpgrade(upgrade: Pallier): Promise<any> {
    return this.http
      .put(this.server + "adventureisis/generic/upgrade", upgrade, {
        headers: this.setHeaders(this.user),
      })
      .toPromise();
  }
  putProduct(product: Product): Promise<any> {
    console.log("requesting putProduct from user" + this.user);
    return this.http
      .put(this.server + "adventureisis/generic/product", product, {
        headers: this.setHeaders(this.user),
      })
      .toPromise();
  }
}
