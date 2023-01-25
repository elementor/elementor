import { ComponentType } from 'react';

export type Location = string;
export type Filler = ComponentType;
export type Name = string;

export type InjectionOptions = {
	priority?: number;
	overwrite?: boolean;
}

export type Injection = {
	location: Location;
	filler: Filler;
	priority: number;
	id: string;
}
