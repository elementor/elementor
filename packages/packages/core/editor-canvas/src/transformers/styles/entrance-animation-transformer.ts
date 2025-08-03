import { createMultiPropsValue } from '../../renderers/multi-props';
import { createTransformer } from '../create-transformer';

type TransformableString = {
	'$$type': 'string';
	value: string;
};

type TransformableNumber = {
	'$$type': 'number';
	value: number;
};

type EntranceAnimation = {
	value?: {
		animation: TransformableString;
		duration: TransformableString;
		delay: TransformableNumber;
	};
};

// Duration values must match PHP Entrance_Animation_Prop_Type::get_duration_values()
const durationValues = {
	slow: 2.0,
	normal: 1.0,
	fast: 0.5,
};

export const entranceAnimationTransformer = createTransformer<EntranceAnimation>( ( value ) => {
	// If no value or empty animation, return null (matches PHP logic)
	if ( ! value?.value?.animation?.value ) {
		return null;
	}

	// Get duration mapping (matches PHP logic)
	const animation = value?.value?.animation?.value ?? '';
	const duration = value?.value?.duration?.value ?? 'normal';
	const delay = value?.value?.delay?.value ?? 0;

	// Convert duration to seconds (matches PHP logic)
	const durationSeconds = durationValues[ duration ] ?? 1.0;

	// Generate CSS animation properties (matches PHP logic)
	const cssProperties: Record<string, string> = {
		'animation-name': animation,
		'animation-duration': `${ durationSeconds }s`,
		'animation-fill-mode': 'both',
		'animation-timing-function': 'ease-in-out',
	};

	// Add delay if specified (matches PHP logic)
	if ( delay > 0 ) {
		cssProperties[ 'animation-delay' ] = `${ delay }s`;
	}

	// Return multi-props object
	return createMultiPropsValue( cssProperties );
} ); 