import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CombinedEventsRoutingModule } from './combined-events-routing.module';
import { BaseComponent } from './base/base.component';
import { EventsComponent } from './events/events.component';


@NgModule({
  declarations: [BaseComponent, EventsComponent],
  imports: [
    CommonModule,
    CombinedEventsRoutingModule
  ]
})
export class CombinedEventsModule { }
