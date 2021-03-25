import { EventEmitter, Input, Output } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { RestserviceService } from "../restservice.service";
import { Pallier, Product } from "../world";
import { BigvaluePipe } from "../bigvalue.pipe";

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.css"],
})
export class ProductComponent implements OnInit {
  product: Product = new Product();
  server: String;
  progressbarvalue: number;
  lastupdate: number;
  _qtmulti: string;
  _money: number;
  totalCost: number;
  numberTransformer: BigvaluePipe;
  maxCanBuy: number;
  canBuy: boolean;
  progressbar: any;

  @Input()
  set qtmulti(value: string) {
    this._qtmulti = value;
    if (this._qtmulti && this.product) this.calcQteMulti();
  }
  @Input()
  set money(value: number) {
    this._money = value;
    this.calcQteMulti();
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
    if (this.product && this.product.timeleft > 0) {
      this.lastupdate = Date.now();
      let progress =
        (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.progressbar.set(progress);
      this.progressbar.animate(1, { duration: this.product.timeleft });
    }
    this.totalCost = this.product.cout;
  }
  @Output()
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  @Output()
  notifyAchat: EventEmitter<Number> = new EventEmitter<Number>();

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    this.numberTransformer = new BigvaluePipe();
  }
  startFabrication() {
    if (this.progressbarvalue == 0) {
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      //this.service.putProduct(this.product);
    }
  }
  startManualFabrication() {
    if (this.progressbarvalue == 0) {
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      this.service.putProduct(this.product);
    }
  }

  calcScore() {
    if (this.product.timeleft != 0) {
      let tempsecoule = Date.now() - this.lastupdate;
      this.lastupdate = Date.now();
      this.product.timeleft = this.product.timeleft - tempsecoule;
      if (this.product.timeleft <= 0) {
        if (this.product.timeleft < 0) {
          this.product.timeleft = 0;
        }
        this.notifyProduction.emit(this.product);
        this.progressbarvalue = 0;
        if (this.product.managerUnlocked) {
          this.startFabrication();
        }
      } else if (this.product.timeleft > 0) {
        this.progressbarvalue =
          ((this.product.vitesse - this.product.timeleft) /
            this.product.vitesse) *
          100;
      }
    } else if (this.product.managerUnlocked) {
      this.startFabrication();
    }
  }

  ngOnInit(): void {
    setInterval(() => {
      this.calcScore();
    }, 100);
    this.progressbarvalue = 0;
    this.canBuy = this.totalCost <= this._money && this._money != 0;
  }
  calcQteMulti() {
    let x = this.product.cout;
    let c = this.product.croissance;
    if (this._qtmulti == "x1") {
      this.totalCost = x;
    } else if (this._qtmulti == "x10") {
      this.totalCost = x * ((1 - c ** 10) / (1 - c));
    } else if (this._qtmulti == "x100") {
      this.totalCost = x * ((1 - c ** 100) / (1 - c));
    } else {
      let n = this.calcMaxCanBuy();
      this.totalCost = x * ((1 - c ** n) / (1 - c));
    }

    this.canBuy = this.totalCost <= this._money && this._money != 0;
    if (this.calcMaxCanBuy() == 0) {
      this.canBuy = false;
    }
  }
  calcMaxCanBuy() {
    let x = this.product.cout;
    let c = this.product.croissance;
    this.maxCanBuy = Math.floor(
      Math.log(-(this._money * (1 - c)) / x + 1) / Math.log(c)
    );

    return this.maxCanBuy;
  }
  achatProduit() {
    if (this._qtmulti == "x1" && this.calcMaxCanBuy() >= 1) {
      this.product.quantite += 1;
      this.notifyAchat.emit(this.totalCost);
    } else if (this._qtmulti == "x10" && this.calcMaxCanBuy() >= 10) {
      this.product.quantite += 10;
      this.notifyAchat.emit(this.totalCost);
    } else if (this._qtmulti == "x100" && this.calcMaxCanBuy() >= 100) {
      this.product.quantite += 100;
      this.notifyAchat.emit(this.totalCost);
    } else if (this._qtmulti == "xMax") {
      this.product.quantite += this.calcMaxCanBuy();
      this.notifyAchat.emit(this.totalCost);
    } else {
      alert("Vous n'avez pas assez d'argent");
    }
    this.service.putProduct(this.product);
  }

  calcUpgrade(unlock: Pallier) {
    switch (unlock.typeratio) {
      case "vitesse":
        if (this.product.timeleft > 0) {
          this.product.timeleft = this.product.timeleft / 2;
        }
        this.product.vitesse = this.product.vitesse / unlock.ratio;
        break;
      case "gain":
        this.product.revenu = this.product.revenu * unlock.ratio;
        break;
    }
  }

  qtMultiDisplay() {
    return this._qtmulti === "xMax" ? "x" + this.maxCanBuy : this._qtmulti;
  }
}
