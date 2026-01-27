// TODO: move all defaults configs here
import { type TimeUnit } from '../types';

type TimeString = `${ number }${ TimeUnit }`;

type DefaultConfig = {
	duration: TimeString;
	delay: TimeString;
};

export const DEFAULT_INTERACTION_CONFIG: DefaultConfig = {
	duration: '600ms',
	delay: '0ms',
};
