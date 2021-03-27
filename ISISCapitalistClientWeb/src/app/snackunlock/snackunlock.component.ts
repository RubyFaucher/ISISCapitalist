import { Component, Inject, OnInit } from "@angular/core";
import { MatSnackBar, MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";

@Component({
  selector: "app-snackunlock",
  templateUrl: "./snackunlock.component.html",
  styleUrls: ["./snackunlock.component.css"],
})
export class SnackunlockComponent implements OnInit {
  _icon: string;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}
}
