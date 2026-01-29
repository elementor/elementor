// TODO: move all defaults configs here
import { type TimeValue } from '../types';

type DefaultConfig = {
	duration: TimeValue;
	delay: TimeValue;
};

export const DEFAULT_INTERACTION_CONFIG: DefaultConfig = {
	duration: 600,
	delay: 0,
};
