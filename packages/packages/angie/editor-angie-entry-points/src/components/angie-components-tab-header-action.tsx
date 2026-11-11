import * as React from 'react';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieComponentsTabHeaderAction = () => (
	<AngieGenerateButton prompt={ ANGIE_PROMPTS.componentsTab() } />
);
