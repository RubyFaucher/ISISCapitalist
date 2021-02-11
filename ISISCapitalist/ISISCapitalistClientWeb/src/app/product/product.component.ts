import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RestserviceService } from '../restservice.service';
import { Product } from '../world';
import 'maths.ts';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  product: Product;
  server: String;
  progressbarvalue: number;
  lastupdate: number;
  _qtmulti: string;
  _money:number;
  totalCost:number;

  @Input()
  set qtmulti(value: string) {
    this._qtmulti= value;
    if(this._qtmulti&& this.product) this.calcMaxCanBuy();
  }
  @Input()
  set money(value: number) {
    this._money= value;
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
  }
  @Output() 
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
  }
  startFabrication() {
    this.product.timeleft = this.product.vitesse;

    this.lastupdate = Date.now();

  }

  calcScore() {
    if (this.product.timeleft != 0) {
      let tempsecoule = Date.now() - this.lastupdate;
      this.product.timeleft = this.product.timeleft - (tempsecoule);
      if (this.product.timeleft <= 0) {
        if (this.product.timeleft < 0) {
          this.product.timeleft = 0;
        }
        this.progressbarvalue = 0;
        this.notifyProduction.emit(this.product);
      }
      else if (this.product.timeleft > 0) {
        this.progressbarvalue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) * 100
      }
    }
  }

  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
    this.progressbarvalue = 0;
  }

  calcMaxCanBuy(){
    let x=this.product.cout;
    let c=this.product.croissance;
    let n=0;
    this.totalCost=x;
    while(this._money >= this.totalCost){
      n++;
      this.totalCost += (x*c^n);
    }
    return n;
  }

}
