import { Component, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of, Subject } from 'rxjs';
import 'rxjs-compat/add/operator/scan';
import 'rxjs-compat/add/observable/fromEvent';
import 'rxjs-compat/add/operator/map';
import 'rxjs-compat/add/operator/mergeMap';
import 'rxjs-compat/add/observable/fromPromise';
import 'rxjs-compat/add/operator/concatAll';
import 'rxjs-compat/add/operator/debounceTime';
import 'rxjs-compat/add/operator/distinctUntilChanged';
import 'rxjs-compat/add/operator/retry';
import 'rxjs-compat/add/operator/takeUntil';
import 'rxjs-compat/add/observable/interval';
import 'rxjs-compat/add/operator/do';
import 'rxjs-compat/add/operator/catch';
import 'rxjs-compat/add/operator/onErrorResumeNext';
import 'rxjs-compat/add/operator/retryWhen';
import 'rxjs-compat/add/operator/delay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  public title = 'learnRxjs';
  public arr: number[] = [1, 2, 3, 4];
  public obs_interval: Observable<number> = Observable.interval(1000);
  private subject: Subject<any> = new Subject();

  constructor(private elementRef: ElementRef, private http: HttpClient) {}

  ngOnInit() {
    this.obs_mergeMap();
    this.obs_scan();
    this.obs_of();
    this.obs_from();
    this.obs_create();
    this.obs_do();
    this.obs_catch();
  }

  obs_create() {
    const myObs = Observable.create((observer) => {
      observer.next('My observable');
      observer.complete();
      observer.next('next wont be triggered');
      observer.error();
    });
    myObs.subscribe(
      (res) => console.log('res of obs_create', res),
      (err) => console.error('err', err),
      () => console.log('completed')
    );
  }

  obs_mergeMap() {
    of('Hello')
      .mergeMap((v) => of(`${v} Rxjs World`))
      .subscribe(
        (res) => console.log('res of obs_mergeMap', res),
        (err) => console.error('err', err),
        () => console.log('completed')
      );
  }

  obs_scan() {
    this.subject.scan((acc, curr) => {
      console.log('acc', acc);
      console.log('curr', curr);
      acc + curr;
    })
    .subscribe(
      (res) => console.log('res of obs_scan()', res),
      (err) => console.error('err', err),
      () => console.log('completed')
    );
  }

  obs_from() {
    from(this.arr).subscribe(
      (res) => console.log('res of obs_from', res),
      (err) => console.error('err', err),
      () => console.log('completed')
    );
  }

  obs_of() {
    of(this.arr).subscribe(
      (res) => console.log('res of obs_of', res),
      (err) => console.error('err', err),
      () => console.log('completed')
    );
  }

  obs_fromEvent() {
    const myEvent = Observable.fromEvent(this.elementRef.nativeElement, 'keyup')
      .map((e) => e.target.value);

    myEvent.subscribe(
      (res) => console.log('res of obs_fromEvent', res),
      (err) => console.error('err', err),
      () => console.log('completed')
    );
  }

  obs_fromPromise() {

    // debounceTime waits until we're done typing
    // distinctUntilChanged ignores events when there are identical to the previous events
    // retry will retry n times our request to avoid micro cuts
    // takeUntil will take the current observable until there is a new one with our key event and will ignore the first observable
    // concactAll concact all Observables to one

    const keyUp = Observable.fromEvent(this.elementRef.nativeElement, 'keyup');

    const myEvent = keyUp
      .map((e) => e.target.value)
      .debounceTime(500)
      .distinctUntilChanged()
      .map((v) => {
        const myPromise = this.http
          .get(`http://www.omdbapi.com/?s=${encodeURIComponent(v)}&apikey=bb4afbfb`)
          .toPromise();
        return Observable
          .fromPromise(myPromise)
          .retry(3)
          .takeUntil(keyUp);
      })
      .concatAll();

    myEvent.subscribe(
      (res) => console.log('res of obs_fromPromise', res),
      (err) => console.error('err', err),
      () => console.log('completed')
    );
  }

  obs_do() {

    // do permits to run a function, it doesn't change our stream

    this.obs_interval
      .do((number) => console.log('number', number))
      .map((number) => number * number)
      .do((num) => console.log('square number', num))
      .map((num) => num - 10);

    this.obs_interval.subscribe(
      (res) => console.log('res of obs_do', res),
      (err) => console.error('err', err),
      () => console.log('completed')
    );
  }

  obs_catch() {

    // throw an error
    // of emits only one value
    // catch the error
    // onErrorResumeNext will continue to run even if we have errors
    // retryWhen will retry n times of errors we've got
    // dalay wil wait before playing the code

    const err = Observable.throw('Error');
    const obs = of('Observable error caught');
    const catchObservableError = err.catch(() => obs);
    const catchError = Observable.onErrorResumeNext(err, obs);

    // first way will stop our observable as we throw an error
    err.subscribe(
      (res) => console.log('first res of obs_do', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

    // second way we catch the error and we return our observable, our app is still running
    catchObservableError.subscribe(
      (res) => console.log('second res of obs_do', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

    // third way
    catchError.subscribe(
      (res) => console.log('third res of obs_do', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

    // fourth way
    this.obs_interval.map((num) => {
      const chance = this.getRandom(1, 3);
      if (chance === 3) {
        console.error('No chance');
      }
      return num;
    })
      .retryWhen((errors) => errors.delay(1000));

    this.obs_interval.subscribe(
      (res) => console.log('fourth res of obs_do', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

  }

  private getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
