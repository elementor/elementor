import { ComponentType } from 'react';

export type Location = string;
export type Filler = ComponentType;
export type Name = string;
export type Id = string;
export type Priority = number;

export type InjectionOptions = {
	priority?: Priority;
	overwrite?: boolean;
}

export type Injection = {
	location: Location;
	filler: Filler;
	priority: Priority;
	id: Id;
}
