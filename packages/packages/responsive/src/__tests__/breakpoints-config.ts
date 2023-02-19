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
			width: 767,
			type: 'max-width',
		},
		mobile_extra: {
			id: 'mobile_extra',
			width: 880,
			type: 'max-width',
		},
		tablet: {
			id: 'tablet',
			width: 1024,
			type: 'max-width',
		},
		tablet_extra: {
			id: 'tablet_extra',
			width: 1200,
			type: 'max-width',
		},
		laptop: {
			id: 'laptop',
			width: 1366,
			type: 'max-width',
		},
		widescreen: {
			id: 'widescreen',
			width: 2400,
			type: 'min-width',
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
			width: 2400,
			type: 'min-width',
		},
		{
			id: 'desktop',
		},
		{
			id: 'laptop',
			width: 1366,
			type: 'max-width',
		},
		{
			id: 'tablet_extra',
			width: 1200,
			type: 'max-width',
		},
		{
			id: 'tablet',
			width: 1024,
			type: 'max-width',
		},
		{
			id: 'mobile_extra',
			width: 880,
			type: 'max-width',
		},
		{
			id: 'mobile',
			width: 767,
			type: 'max-width',
		},
	];
}
