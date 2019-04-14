import { Component,OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';

import { MessagingService } from "./services/messaging.service";
import { Message, StompHeaders } from "@stomp/stompjs";
import { StompState } from "@stomp/ng2-stompjs";
import { VehicleService } from './services/vehicle.service';


export interface VehicleData {
  name: string;
  vehicleId: string;
  registrationNo: string;
  status: number;
}

const WEBSOCKET_URL = "ws://192.168.8.100:8080/socket";
const RCV_URL = "/vehicle/broadcaster";

@Component({
  selector: 'app-root',
  styleUrls: ['app.vehicle-info.css'],
  templateUrl: 'app.vehicle-info.html',
})
export class AppVehicleInfo implements OnInit {
  vehicles : Array<VehicleData>;
  displayedColumns: string[] = ['name', 'vehicleId', 'registrationNo', 'status'];
  dataSource = new MatTableDataSource(this.vehicles);

  statusFilter = new FormControl();
  nameFilter = new FormControl();
  filteredValues = { name:'', vehicleId:'',registrationNo:'',  status:''};
ngOnInit() {

    this.vehicleService.getAll().subscribe(data => {
      this.vehicles = data;
      this.dataSource.data=data;
      console.log(this.vehicles);

    });
    this.statusFilter.valueChanges.subscribe((statusFilterValue)=> {
    this.filteredValues['status'] = statusFilterValue;
    this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.nameFilter.valueChanges.subscribe((nameFilterValue) => {
      this.filteredValues['name'] = nameFilterValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
      
    });

  this.dataSource.filterPredicate = this.customFilterPredicate();
  
}

  customFilterPredicate() {
    const myFilterPredicate = function(data:VehicleData, filter:string) :boolean {
      let searchString = JSON.parse(filter);
      console.log("filter-->" +filter);
      let nameFound = data.name.toString().trim().toLowerCase().indexOf(searchString.name.toLowerCase()) !== -1
      let statusFound = data.status.toString().trim().indexOf(searchString.status) !== -1
      return nameFound && statusFound 
    }
    return myFilterPredicate;
  }

  private messagingService: MessagingService;

  messageHistory = [];
  state: string = "NOT CONNECTED";

  constructor(private vehicleService: VehicleService) {
    // Instantiate a messagingService
    this.messagingService = new MessagingService(WEBSOCKET_URL, RCV_URL);

    // Subscribe to its stream (to listen on messages)
    this.messagingService.stream().subscribe((message: Message) => {
      this.messageHistory.unshift(message.body);
      console.log("all -> "+message);
      console.log("body -> "+message.body);
      console.log("headers -> "+JSON.stringify(message.headers['regNo']));

      if(message.body!="SUBSCRIBED"){

        this.vehicles.find(item => item.registrationNo == message.headers['regNo']).status = parseInt(message.body);

      }

      this.dataSource.data=this.vehicles;
    });
    // Subscribe to its state (to know its connected or not)
    this.messagingService.state().subscribe((state: StompState) => {
      this.state = StompState[state];
    });
  }
  
}
