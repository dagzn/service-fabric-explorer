import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.scss']
})
export class EssentialsComponent implements OnInit {

  constructor(public dataService: DataService) { }

  ngOnInit() {
    // this.dataService.getClusterUpgradeProgress().subscribe( data => {
    //   console.log(data);
    // })
    // this.dataService.getClusterUpgradeProgress().subscribe( data => {
    //   console.log(data);
    // })
    // this.dataService.getClusterLoadInformation().subscribe( data => {
    //   console.log(data);
    // })

    // this.dataService.getApps().subscribe( data => {
    //   console.log(data)
    //   this.dataService.getServices(data.collection[0].id).subscribe( data2 => {
    //     console.log(data2);
    //   })
    // })

    this.dataService.getNodes().subscribe( data => 
      console.log(data));

    // this.dataService.getAppTypeGroups().subscribe( data => {
    //   console.log(data);
    // })
  }

}