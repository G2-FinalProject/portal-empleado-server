export interface LocationAttributes {
  id: number;
  location_name: string;
}

export type LocationCreationAttributes = Omit<LocationAttributes, 'id'>;
