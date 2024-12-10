import { Route, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth-guard.guard';
import { loginGuard } from './guard/login.guard';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FullComponent } from './layouts/full/full.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardSuperAdminComponent } from './content/SuperAdmin/dashboard/dashboard.component';
import { SchoolsComponent } from './content/SuperAdmin/schools/schools.component';
import { DriversComponent } from './content/SuperAdmin/drivers/drivers.component';
import { VehiclesComponent } from './content/SuperAdmin/vehicles/vehicles.component';
import { UsersComponent } from './content/SuperAdmin/superadmin/users.component';
import { AdminsComponent } from './content/SuperAdmin/admins/admins.component';
import { SuperadminProfileComponent } from './content/SuperAdmin/profile/profile.component';
import { DashboardAdminComponent } from './content/Admin/dashboard/dashboard.component';
import { ProfileAdminComponent } from './content/Admin/profile/profile.component';
import { StudentsComponent } from './content/Admin/students/students.component';
import { DashboardParentComponent } from './content/Parent/dashboard/dashboard.component';
import { ProfileParentComponent } from './content/Parent/profile/profile.component';
import { DashboardDriverComponent } from './content/Driver/dashboard/dashboard.component';
import { ProfileDriverComponent } from './content/Driver/profile/profile.component';

const superAdminChildrenRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardSuperAdminComponent,
    data: { breadcrumb: 'Dashboard' },
  },
  {
    path: 'profile',
    component: SuperadminProfileComponent,
    data: { breadcrumb: 'Profile' },
  },
  {
    path: 'superadmins',
    component: UsersComponent,
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
    data: { breadcrumb: 'Admins' },
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
    path: 'profile',
    component: ProfileAdminComponent,
    data: { breadcrumb: 'Profile' },
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
  },
  {
    path: 'profile',
    component: ProfileParentComponent,
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
  },
  {
    path: 'profile',
    component: ProfileDriverComponent,
  },
];

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'login',
    component: LoginComponent,

    // Digunakan untuk mencegah user yg memiliki token untuk mengakses /login
    canActivate: [loginGuard],
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
