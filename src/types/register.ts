export type RegisterFormData = {
  fname: string;
  lname: string;
  email: string;
  password: string;
  password_confirmation: string;
  mobile_number: string;
  address: string;
  birthday: string;
  gender: string;
  user_type_id: number;
  brgy_clearance: FormImage | null;
  valid_id_front: FormImage | null;
  valid_id_back: FormImage | null;
  valid_id_type: string | number;
  id_number: string;
};
export type FormImage = {
  uri: string;
  name: string;
  type: string;
};
