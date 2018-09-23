import { Component, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, of, ReplaySubject, Subject } from 'rxjs';
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
import 'rxjs-compat/add/operator/merge';
import 'rxjs-compat/add/operator/publish';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  public title = 'RxJS';
  public arr: number[] = [1, 2, 3, 4];
  public obs_interval: Observable<number> = Observable.interval(1000);

  // Subject is an observable and an observer
  public subject: Subject<any> = new Subject();

  constructor(private elementRef: ElementRef, private http: HttpClient) {}

  ngOnInit() {
    this.obs_mergeMap();
    this.obs_of();
    this.obs_from();
    this.obs_create();
    this.obs_do();
    this.obs_catch();
    this.obs_subject();
    this.obs_cold();
    this.obs_hot();
    this.obs_replaySubject();
    this.obs_behaviorSubject();
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

  /*obs_scan() {
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
  }*/

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

  /*obs_fromEvent() {
    const myEvent = Observable.fromEvent(this.elementRef.nativeElement, 'keyup')
      .map((e) => e.target.value);

    myEvent.subscribe(
      (res) => console.log('res of obs_fromEvent', res),
      (err) => console.error('err', err),
      () => console.log('completed')
    );
  }*/

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

  obs_subject() {
    // its the mediator between our observable and our observer

    const subject = new Subject();
    const source = Observable.interval(1000);
    // first example
    source.subscribe(subject);
    subject.subscribe(
      (res) => console.log('first ex of res of obs_subject', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

    // second example
    const sourceA = Observable.interval(1000)
      .map((v) => `A: ${v}`);
    const sourceB = Observable.interval(2000)
      .map((v) => `B: ${v}`);
    sourceA.merge(sourceB).subscribe(subject);

    subject.subscribe(
      (res) => console.log('second ex of res of obs_subject', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

  }

  obs_cold() {
    const cold = Observable.interval(1000);
    let sub1, sub2;

    sub1 = cold.subscribe(
      (res) => console.log('sub1 res of obs_cold', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

    setTimeout(() => {
      sub2 = cold.subscribe(
        (res) => console.log('sub2 res of obs_cold', res),
        (error) => console.error('error', error),
        () => console.log('completed')
      );
    }, 3000);

    setTimeout(() => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    }, 6000);

  }

  obs_hot() {
    // publish converts cold observable to an hot observable
    const hot = Observable.interval(1000).publish();
    // connect starts the transmission
    hot.connect();
    let sub1, sub2;

    sub1 = hot.subscribe(
      (res) => console.log('sub1 res of obs_hot', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

    setTimeout(() => {
      sub2 = hot.subscribe(
        (res) => console.log('sub2 res of obs_hot', res),
        (error) => console.error('error', error),
        () => console.log('completed')
      );
    }, 3000);

    setTimeout(() => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    }, 6000);

  }

  obs_replaySubject() {
    const hot = Observable.interval(1000).publish();
    hot.connect();
    let sub1, sub2;
    // replaySubject keeps in memory n last number of elements its data sequence
    // here will keep the 3 last elements
    const replaySubject = new ReplaySubject(3);
    hot.subscribe(replaySubject);

    sub1 = replaySubject.subscribe(
      (res) => console.log('sub1 res of obs_replaySubject', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

    setTimeout(() => {
      sub2 = replaySubject.subscribe(
        (res) => console.log('sub2 res of obs_replaySubject', res),
        (error) => console.error('error', error),
        () => console.log('completed')
      );
    }, 2500);

    setTimeout(() => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    }, 6000);

  }

  obs_behaviorSubject() {
    const hot = Observable.interval(1000).publish();
    hot.connect();
    let sub1, sub2;
    // BehaviorSubject keeps in memory only one element
    // it emits a first default value
    const behaviorSubject = new BehaviorSubject(-1);
    hot.subscribe(behaviorSubject);

    sub1 = behaviorSubject.subscribe(
      (res) => console.log('sub1 res of obs_behaviorSubject', res),
      (error) => console.error('error', error),
      () => console.log('completed')
    );

    setTimeout(() => {
      sub2 = behaviorSubject.subscribe(
        (res) => console.log('sub2 res of obs_behaviorSubject', res),
        (error) => console.error('error', error),
        () => console.log('completed')
      );
    }, 2500);

    setTimeout(() => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    }, 6000);
  }

  private getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
