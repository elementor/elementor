import * as React from 'react';
import { type VariableFormHeaderProps } from '@elementor/editor-variables';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieVariableFormHeaderAction = ( props: VariableFormHeaderProps ) => (
	<AngieGenerateButton prompt={ ANGIE_PROMPTS.variableForm( props ) } />
);
