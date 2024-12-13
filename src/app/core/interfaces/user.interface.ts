export interface User {
  user_uuid: string;
  user_username: string;
  user_email: string;
  user_status: string;
  user_last_active: string;
  created_at: string;
  user_details: UserDetail;
}

interface UserDetail {
  user_first_name: string;
  user_last_name: string;
  user_gender: string;
  user_phone: string;
}
