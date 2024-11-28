import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { ColDef } from 'ag-grid-community';
import axios from 'axios';
interface IRow {
  body: string;
  email: string;
  id: number;
  name: string;
  postId: number;
}



@Component({
  selector: 'app-students',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit{

  ngOnInit(): void {
    this.woi()
  }
  gridOptions = {
    ensureDomOrder: true,
    enableAccessibility: false,
  };


  themeClass =
      "ag-theme-quartz";
  
    // Row Data: The data to be displayed.
    rowData: IRow[] = [];

    // Column Definitions
    colDefs: ColDef<IRow>[] = [
      { headerName: 'No.', valueGetter: 'node.rowIndex + 1', width: 90 },
      { headerName: 'Id Data.', field: 'id' },
      { field: 'name' },
      { field: 'email' },
      { field: 'postId' },
      { field: 'body' }
    ];
  
    // Default column definitions for consistency
    defaultColDef: ColDef = {
      flex: 1,
    };
  
  

  woi() {
    axios.get('https://jsonplaceholder.typicode.com/comments')
      .then(response => {
        console.log(response.data); // Handle the response data here
        this.rowData = response.data; // Update rowData with fetched data
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

}
