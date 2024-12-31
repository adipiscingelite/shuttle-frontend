export interface Driver {
  user_uuid: string;
  user_username: string;
  user_email: string;
  user_status: string;
  user_last_active: string;
  license_number: string;
  created_at: string;
  user_details: DriverDetail;
}

export interface DriverDetail {
  school_uuid: string;
  school_name: string;
  user_picture: string;
  user_first_name: string;
  user_last_name: string;
  user_gender: string;
  user_phone: string;
  user_address: string;
}