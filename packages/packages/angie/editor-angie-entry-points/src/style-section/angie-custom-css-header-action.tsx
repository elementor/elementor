import * as React from 'react';
import { type CustomCssHeaderProps } from '@elementor/editor-editing-panel';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieCustomCssHeaderAction = ( props: CustomCssHeaderProps ) => (
	<AngieGenerateButton prompt={ ANGIE_PROMPTS.customCss( props ) } />
);
