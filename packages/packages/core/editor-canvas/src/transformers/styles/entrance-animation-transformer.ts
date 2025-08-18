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

export const entranceAnimationTransformer = createTransformer<EntranceAnimation>((value) => {
    console.log('Entrance Animation Transformer called with:', value);

    // Handle flattened structure
    const animation = value?.animation || '';
    const duration = value?.duration || 'normal';
    const delay = value?.delay || 0;

    if (!animation) {
        return null;
    }

    // Convert duration to seconds
    const durationSeconds = durationValues[duration] ?? 1.0;

    // Generate CSS properties
    const cssProperties: Record<string, string> = {
        'animation-name': animation,
        'animation-duration': `${durationSeconds}s`,
        'animation-fill-mode': 'forwards',
        'animation-timing-function': 'ease-in-out',
    };

    if (delay > 0) {
        cssProperties['animation-delay'] = `${delay}s`;
    }

    console.log('Generated CSS properties:', cssProperties);
    return createMultiPropsValue(cssProperties);
}); 