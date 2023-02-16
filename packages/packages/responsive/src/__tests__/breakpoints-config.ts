import { State } from '../store';
import { Breakpoint } from '../types';

export function getBreakpointsConfig() {
	return {
		mobile: {
			value: 767,
			direction: 'max',
			is_enabled: true,
		},
		mobile_extra: {
			value: 880,
			direction: 'max',
			is_enabled: true,
		},
		tablet: {
			value: 1024,
			direction: 'max',
			is_enabled: true,
		},
		tablet_extra: {
			value: 1200,
			direction: 'max',
			is_enabled: true,
		},
		laptop: {
			value: 1366,
			direction: 'max',
			is_enabled: true,
		},
		widescreen: {
			value: 2400,
			direction: 'min',
			is_enabled: true,
		},
	} as const;
}

export function getNormalizedBreakpointsConfig(): State['entities'] {
	return {
		mobile: {
			id: 'mobile',
			size: 767,
			type: 'up-to',
		},
		mobile_extra: {
			id: 'mobile_extra',
			size: 880,
			type: 'up-to',
		},
		tablet: {
			id: 'tablet',
			size: 1024,
			type: 'up-to',
		},
		tablet_extra: {
			id: 'tablet_extra',
			size: 1200,
			type: 'up-to',
		},
		laptop: {
			id: 'laptop',
			size: 1366,
			type: 'up-to',
		},
		widescreen: {
			id: 'widescreen',
			size: 2400,
			type: 'from',
		},
		desktop: {
			id: 'desktop',
		},
	};
}

export function getSortedBreakpoints(): Breakpoint[] {
	return [
		{
			id: 'widescreen',
			size: 2400,
			type: 'from',
		},
		{
			id: 'desktop',
		},
		{
			id: 'laptop',
			size: 1366,
			type: 'up-to',
		},
		{
			id: 'tablet_extra',
			size: 1200,
			type: 'up-to',
		},
		{
			id: 'tablet',
			size: 1024,
			type: 'up-to',
		},
		{
			id: 'mobile_extra',
			size: 880,
			type: 'up-to',
		},
		{
			id: 'mobile',
			size: 767,
			type: 'up-to',
		},
	];
}
