import { FC } from 'react';

type MakeOptional<Type, Key extends keyof Type> =
	Omit<Type, Key> &
	Partial<Pick<Type, Key>>;

export type Filler = {
	location: string;
	component: FC;
	priority: number;
};

export type FillerWithOptionalPriority = MakeOptional<Filler, 'priority'>;
