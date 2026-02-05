import { type Unit } from '@elementor/editor-controls';

type TimeUnit = Extract< Unit, 'ms' | 's' >;
const UNIT_TO_MS: Record< TimeUnit, number > = {
	ms: 1,
	s: 1000,
};

export const convertTimeUnit = ( value: number, from: TimeUnit, to: TimeUnit ): number => {
	return ( value * UNIT_TO_MS[ from ] ) / UNIT_TO_MS[ to ];
};
