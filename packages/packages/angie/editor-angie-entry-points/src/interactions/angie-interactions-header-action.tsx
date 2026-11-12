import * as React from 'react';
import { type InteractionsHeaderProps } from '@elementor/editor-interactions';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieInteractionsHeaderAction = ( { elementId }: InteractionsHeaderProps ) => (
	<AngieGenerateButton prompt={ ANGIE_PROMPTS.interactions( { elementId } ) } />
);
