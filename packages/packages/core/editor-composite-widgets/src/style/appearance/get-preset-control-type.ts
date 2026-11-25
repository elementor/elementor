import { type CompositeWidgetPreset } from '../../types';

export type PresetControlType = 'inline-toggle' | 'full-width-toggle' | 'select';

const MAX_INLINE_TOGGLE_OPTIONS = 2;
const MAX_TOGGLE_OPTIONS = 3;

export function getPresetControlType( preset: CompositeWidgetPreset ): PresetControlType {
	const optionsCount = preset.options.length;

	if ( optionsCount <= MAX_INLINE_TOGGLE_OPTIONS ) {
		return 'inline-toggle';
	}

	if ( optionsCount <= MAX_TOGGLE_OPTIONS ) {
		return 'full-width-toggle';
	}

	return 'select';
}
