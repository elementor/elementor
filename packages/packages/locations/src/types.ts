import { FC } from 'react';

export type Location = string;
export type Filler = FC; // TODO: Support class components.
export type Priority = number;
export type Id = string;

export type InjectionOptions = {
	priority?: Priority;
	id?: Id;
}

export type Injection = {
	location: Location;
	filler: Filler;
	priority: Priority;
	id: Id;
}
