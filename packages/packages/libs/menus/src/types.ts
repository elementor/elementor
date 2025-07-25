import { type ComponentType } from 'react';
import { type Location } from '@elementor/locations';

export type LocationsMap< TGroups extends string > = Record< TGroups, Location >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for TS to infer the props properly.
export type Components = Record< string, ComponentType< any > >;

export type MenuGroups< TGroups extends string > = TGroups | 'default';
