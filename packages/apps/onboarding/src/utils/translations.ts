import { createTranslate } from '@elementor/utils';

import { DEFAULT_STRINGS } from './default-strings';

export const t = createTranslate( {
	configKey: 'onboarding',
	defaultStrings: DEFAULT_STRINGS,
} );
