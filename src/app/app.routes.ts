import { Route, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { LoginComponent } from './auth/login/login.component';
import { LandingComponent } from './home/landing/landing.component';
import { FullComponent } from './layouts/full/full.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { DashboardSuperAdminComponent } from './content/SuperAdmin/dashboard/dashboard.component';
import { SchoolsComponent } from './content/SuperAdmin/lists-school/schools.component';
import { DriversComponent } from './content/SuperAdmin/lists-driver/drivers.component';
import { VehiclesComponent } from './content/SuperAdmin/lists-vehicle/vehicles.component';
import { SuperadminsComponent } from './content/SuperAdmin/lists-superadmin/superadmins.component';
import { AdminsComponent } from './content/SuperAdmin/lists-admin/admins.component';
import { SuperadminProfileComponent } from './content/SuperAdmin/my-profile/profile.component';
import { DashboardAdminComponent } from './content/Admin/dashboard/dashboard.component';
import { ProfileAdminComponent } from './content/Admin/profile/profile.component';
import { StudentsComponent } from './content/Admin/list-students/students.component';
import { DashboardParentComponent } from './content/Parent/dashboard/dashboard.component';
import { ProfileParentComponent } from './content/Parent/my-profile/profile.component';
import { DashboardDriverComponent } from './content/Driver/dashboard/dashboard.component';
import { ProfileDriverComponent } from './content/Driver/my-profile/profile.component';
import { AttendanceComponent } from './content/Parent/attendance/attendance.component';
import { ChildernComponent } from './content/Parent/my-childern/childern.component';
import { TrackChildernComponent } from './content/Parent/track-childern/track-childern.component';
import { RouteManagementComponent } from './content/Driver/route-management/route-management.component';
import { ShuttleHistoryComponent } from './content/Driver/shuttle-history/shuttle-history.component';
import { NotificationComponent } from './content/notification/notification.component';
import { SchoolAdminDriversComponent } from './content/Admin/list-drivers/drivers.component';
import { RoutesComponent } from './content/Admin/list-routes/routes.component';
import { VehiclesAdminComponent } from './content/Admin/list-vehicles/vehicles.component';
import { DriverManagementComponent } from './content/Admin/driver-management/driver-management.component';
import { TripReportComponent } from './content/Driver/trip-report/trip-report.component';

const superAdminChildrenRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    // title: 'Superadmin - Dashboard',
    path: 'dashboard',
    component: DashboardSuperAdminComponent,
    data: { breadcrumb: 'Dashboard' },
  },
  {
    // title: 'Superadmin - Profile',
    path: 'profile',
    component: SuperadminProfileComponent,
    data: { breadcrumb: 'Profile' },
  },
  {
    path: 'my/notification',
    component: NotificationComponent,
    data: { breadcrumb: 'Notification' },
  },
  {
    path: 'superadmins',
    component: SuperadminsComponent,
    data: { breadcrumb: 'Super Admins' },
  },
  {
    path: 'schools',
    component: SchoolsComponent,
    data: { breadcrumb: 'Schools' },
  },
  {
    path: 'admins',
    component: AdminsComponent,
    data: { breadcrumb: 'School Admins' },
  },
  {
    path: 'drivers',
    component: DriversComponent,
    data: { breadcrumb: 'Drivers' },
  },
  {
    path: 'vehicles',
    component: VehiclesComponent,
    data: { breadcrumb: 'Vehicles' },
  },
];

const adminChildrenRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardAdminComponent,
    data: { breadcrumb: 'Dashboard' },
  },
  {
    path: 'students',
    component: StudentsComponent,
    data: { breadcrumb: 'Students' },
  },
  {
    path: 'drivers',
    component: SchoolAdminDriversComponent,
    data: { breadcrumb: 'Drivers' },
  },
  {
    path: 'driver-monitoring',
    component: DriverManagementComponent,
    data: { breadcrumb: 'Drivers Monitoring' },
  },
  {
    path: 'routes',
    component: RoutesComponent,
    data: { breadcrumb: 'Routes' },
  },
  {
    path: 'vehicles',
    component: VehiclesAdminComponent,
    data: { breadcrumb: 'Vehicles' },
  },
  {
    path: 'profile',
    component: ProfileAdminComponent,
    data: { breadcrumb: 'Profile' },
  },
  {
    path: 'my/notification',
    component: NotificationComponent,
    data: { breadcrumb: 'Notification' },
  },
];

const parentChildrenRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardParentComponent,
    data: { breadcrumb: 'Dashboard' },
  },
  {
    path: 'attendance',
    component: AttendanceComponent,
    data: { breadcrumb: 'Attendance List' },
  },
  {
    path: 'tracking',
    component: TrackChildernComponent,
    data: { breadcrumb: 'Location Tracking' },
    children: [
      {
        path: 'details/:uuid',
        component: TrackChildernComponent,
        data: { breadcrumb: 'Detail' },
      },
    ],
  },
  {
    path: 'my-childern',
    component: ChildernComponent,
    data: { breadcrumb: 'Children Information' },
  },
  {
    path: 'profile',
    component: ProfileParentComponent,
    data: { breadcrumb: 'Profile' },
  },
  {
    path: 'my/notification',
    component: NotificationComponent,
    data: { breadcrumb: 'Notification' },
  },
];

const driverChildrenRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardDriverComponent,
    data: { breadcrumb: 'Dashboard' },
  },
  {
    path: 'shuttle',
    component: RouteManagementComponent,
    data: { breadcrumb: 'Shuttle Pick Up' },
  },
  {
    path: 'shuttle-history',
    component: ShuttleHistoryComponent,
    data: { breadcrumb: 'Shuttle History' },
  },
  {
    path: 'trip-report',
    component: TripReportComponent,
    data: { breadcrumb: 'Report' },
  },
  // {
  //   path: 'absence',
  //   component: AbsenceComponent,
  //   data: { breadcrumb: 'Request Absence' },
  // },
  {
    path: 'profile',
    component: ProfileDriverComponent,
    data: { breadcrumb: 'Profile' },
  },
  {
    path: 'my/notification',
    component: NotificationComponent,
    data: { breadcrumb: 'Notification' },
  },
];

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,

    // Digunakan untuk mencegah user yg memiliki token untuk mengakses /login
    canActivate: [GuestGuard],
  },
  {
    path: 'superadmin',
    component: FullComponent,

    // Digunakan untuk mencegah user yg tidak memiliki token untuk mengakses /superadmin
    canActivate: [AuthGuard],
    children: superAdminChildrenRoutes,
  },
  {
    path: 'admin',
    component: FullComponent,

    // Digunakan untuk mencegah user yg tidak memiliki token untuk mengakses /admin
    canActivate: [AuthGuard],
    children: adminChildrenRoutes,
  },
  {
    path: 'driver',
    component: FullComponent,

    // Digunakan untuk mencegah user yg tidak memiliki token untuk mengakses /driver
    canActivate: [AuthGuard],
    children: driverChildrenRoutes,
  },
  {
    path: 'parent',
    component: FullComponent,

    // Digunakan untuk mencegah user yg tidak memiliki token untuk mengakses /parent
    canActivate: [AuthGuard],
    children: parentChildrenRoutes,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
