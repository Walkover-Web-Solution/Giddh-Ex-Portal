import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { GeneralService } from '../services/general.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  /** True if api call in progress */
  public isLoading: boolean = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private generalService: GeneralService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
  }

}
