import * as React from 'react';
import { type StyleSectionHeaderProps } from '@elementor/editor-editing-panel';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const CUSTOM_CSS_SECTION_NAME = 'Custom CSS';

export const AngieCustomCssHeaderAction = ( props: StyleSectionHeaderProps ) => (
	<AngieGenerateButton prompt={ ANGIE_PROMPTS.customCss( props ) } />
);
