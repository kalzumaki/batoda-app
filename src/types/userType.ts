export interface UserType {
  id: number;
  name: string;
}

export const userTypeMap: {[key: number]: string} = {
  1: 'admin',
  2: 'president',
  3: 'secretary',
  4: 'treasurer',
  5: 'auditor',
  6: 'driver',
  7: 'dispatcher',
  8: 'passenger',
};
