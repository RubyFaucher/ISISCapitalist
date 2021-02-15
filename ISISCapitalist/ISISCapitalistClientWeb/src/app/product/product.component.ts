import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RestserviceService } from '../restservice.service';
import { Product } from '../world';
import { BigvaluePipe } from '../bigvalue.pipe';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  product: Product = new Product();
  server: String;
  progressbarvalue: number;
  lastupdate: number;
  _qtmulti: string;
  _money:number;
  totalCost:number;
  numberTransformer:BigvaluePipe;
  maxCanBuy:number;

  

  @Input()
  set qtmulti(value: string) {
    this._qtmulti= value;
    
    if(this._qtmulti&& this.product) this.calcQteMulti();
    
  }
  @Input()
  set money(value: number) {
    this._money= value;
    this.calcQteMulti();
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
    this.totalCost = this.product.cout;
  }
  @Output() 
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    this.numberTransformer = new BigvaluePipe();
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
  calcQteMulti(){
    let x=this.product.cout;
    let c=this.product.croissance;
    if(this._qtmulti=="x1"){

      this.totalCost=x;
    }
    else if(this._qtmulti=="x10"){
      this.totalCost=x*((1-(c**10))/(1-c));
    }
    else if(this._qtmulti=="x100"){
      this.totalCost=x*((1-(c**100))/(1-c));
    }
    else{
      let n=this.calcMaxCanBuy();
      this.totalCost=x*((1-(c**n))/(1-c));
    }

  }
  calcMaxCanBuy(){
    let x=this.product.cout;
    let c=this.product.croissance;
    this.maxCanBuy=Math.floor((Math.log((-(this._money*(1-c))/x)+1))/(Math.log(c)));
    return this.maxCanBuy;
  }

  qtMultiDisplay(){
    return this._qtmulti === "xMax" ? "x"+this.maxCanBuy : this._qtmulti;
  }

}
