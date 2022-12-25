import { FC } from 'react';

type MakeOptional<Type, Key extends keyof Type> =
	Omit<Type, Key> &
	Partial<Pick<Type, Key>>;

export type Fill = {
	location: string;
	component: FC; // TODO: support class components.
	priority: number;
};

export type FillWithOptionalPriority = MakeOptional<Fill, 'priority'>;
