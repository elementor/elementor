import * as React from 'react';
import { type StyleTabHeaderProps } from '@elementor/editor-editing-panel';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieStyleTabHeaderAction = ( props: StyleTabHeaderProps ) => (
	<AngieGenerateButton prompt={ ANGIE_PROMPTS.styleTab( props ) } />
);
