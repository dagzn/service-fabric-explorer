import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ITimelineData, TimeLineGeneratorBase, parseEventsGenerically, NodeTimelineGenerator, ApplicationTimelineGenerator } from 'src/app/Models/eventstore/timelineGenerators';
import { EventListBase } from 'src/app/Models/DataModels/collections/Collections';
import { FabricEventBase } from 'src/app/Models/eventstore/Events';
import { TimeUtils } from 'src/app/Utils/TimeUtils';
import { IOnDateChange } from '../double-slider/double-slider.component';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import { DataGroup, DataItem, DataSet } from 'vis-timeline';

export interface IQuickDates {
    display: string;
    hours: number;
}
@Component({
  selector: 'app-event-store',
  templateUrl: './event-store.component.html',
  styleUrls: ['./event-store.component.scss']
})
export class EventStoreComponent implements OnInit, OnDestroy {

  constructor(public dataService: DataService) { }

  public get showAllEvents() { return this.pshowAllEvents; }
  public set showAllEvents(state: boolean) {
      this.pshowAllEvents = state;
      this.setTimelineData();
  }

  public static MaxWindowInDays = 7;

  private debounceHandler: Subject<IOnDateChange> = new Subject<IOnDateChange>();
  private debouncerHandlerSubscription: Subscription;

  public quickDates = [
    { display: '1 hours', hours: 1},
    { display: '3 hours', hours: 3},
    { display: '6 hours', hours: 6},
    { display: '1 day', hours: 24},
    { display: '7 days', hours: 168 }
  ];

  @Input() eventsList: EventListBase<any>;
  @Input() timelineGenerator: TimeLineGeneratorBase<FabricEventBase>;

  eventsLists: EventListBase<FabricEventBase>[] = [];

  public startDateMin: Date;
  public endDateMin: Date;
  public startDateMax: Date;
  public endDateMax: Date;
  public endDateInit: Date;
  public isResetEnabled = false;
  public timeLineEventsData: ITimelineData;

  public transformText = 'Category,Kind';

  private pshowAllEvents = false;

  public startDate: Date;
  public endDate: Date;

  ngOnInit() {
    this.eventsLists = [
        this.dataService.createNodeEventList(),
        this.dataService.createApplicationEventList(),
    ]

    this.pshowAllEvents = !this.timelineGenerator;
    this.resetSelectionProperties();
    this.setTimelineData();
    this.debouncerHandlerSubscription = this.debounceHandler
    .pipe(debounceTime(400), distinctUntilChanged())
    .subscribe(dates => {
        this.startDate = dates.startDate;
        this.endDate = dates.endDate;
        this.setNewDateWindow();
     });
  }

  ngOnDestroy() {
      this.debouncerHandlerSubscription.unsubscribe();
  }

  public reset(): void {
      this.isResetEnabled = false;
      if (this.eventsList.resetDateWindow()) {
          this.resetSelectionProperties();
          this.eventsList.reload().subscribe( data => {
              this.setTimelineData();
          });
      } else {
          this.resetSelectionProperties();
      }
  }

  private resetSelectionProperties(): void {
      this.startDate = this.eventsList.startDate;
      this.endDate = this.eventsList.endDate;
      this.startDateMin = this.endDateMin = TimeUtils.AddDays(new Date(), -30);
      this.startDateMax = this.endDateMax = new Date(); // Today
  }

  public setDate(date: IQuickDates) {
      this.setNewDates({
        endDate: new Date(this.eventsList.endDate),
        startDate: TimeUtils.AddHours(this.endDate, -1 * date.hours)
      });
  }

  private setNewDateWindow(): void {
      if (this.eventsList.setDateWindow(this.startDate, this.endDate)) {
          this.eventsLists.forEach(eventHandler => {
              eventHandler.setDateWindow(this.startDate, this.endDate);
          })
          this.resetSelectionProperties();
          this.isResetEnabled = true;
        //   this.eventsList.reload().subscribe( data => {
              this.setTimelineData();
        //   });
      } else {
          this.resetSelectionProperties();
      }
  }

  public async setTimelineData() {

    const groups = new DataSet<DataGroup>();
    const items = new DataSet<DataItem>();

    await forkJoin(this.eventsLists.concat(this.eventsList).map(l => l.ensureInitialized())).toPromise();

    await forkJoin(this.eventsLists.concat(this.eventsList).map(l => l.reload())).toPromise();

    this.eventsLists.concat(this.eventsList).forEach(list => {
        const data: ITimelineData = list.getTimelineEvents();
        console.log(list);
        data.groups.forEach(item => {
            groups.add(item)
        })
        data.items.forEach(item => {
            items.add(item);
        })
        console.log(groups,items)
    })

    this.timeLineEventsData = {
        groups,
        items,
        start: this.startDate,
        end: this.endDate
    }
    // try {
    //     if (this.pshowAllEvents) {
    //         const d = parseEventsGenerically(this.eventsList.collection.map(event => event.raw), this.transformText);

    //         this.timeLineEventsData = {
    //             groups: d.groups,
    //             items: d.items,
    //             start: this.startDate,
    //             end: this.endDate,
    //             potentiallyMissingEvents: d.potentiallyMissingEvents
    //         };

    //     }else if (this.timelineGenerator) {
    //         const d = this.timelineGenerator.generateTimeLineData(this.eventsList.collection.map(event => event.raw), this.startDate, this.endDate);

    //         this.timeLineEventsData = {
    //             groups: d.groups,
    //             items: d.items,
    //             start: this.startDate,
    //             end: this.endDate,
    //             potentiallyMissingEvents: d.potentiallyMissingEvents
    //         };
    //     }
    // }catch (e) {
    //     console.error(e);
    // }

    // this.eventsList.ensureInitialized().subscribe( () => {
    //     try {
    //         if (this.pshowAllEvents) {
    //             const d = parseEventsGenerically(this.eventsList.collection.map(event => event.raw), this.transformText);

    //             this.timeLineEventsData = {
    //                 groups: d.groups,
    //                 items: d.items,
    //                 start: this.startDate,
    //                 end: this.endDate,
    //                 potentiallyMissingEvents: d.potentiallyMissingEvents
    //             };

    //         }else if (this.timelineGenerator) {
    //             const d = this.timelineGenerator.generateTimeLineData(this.eventsList.collection.map(event => event.raw), this.startDate, this.endDate);

    //             this.timeLineEventsData = {
    //                 groups: d.groups,
    //                 items: d.items,
    //                 start: this.startDate,
    //                 end: this.endDate,
    //                 potentiallyMissingEvents: d.potentiallyMissingEvents
    //             };
    //         }
    //     }catch (e) {
    //         console.error(e);
    //     }
    // });
    }

    setNewDates(dates: IOnDateChange) {
        this.debounceHandler.next(dates);
    }
}
