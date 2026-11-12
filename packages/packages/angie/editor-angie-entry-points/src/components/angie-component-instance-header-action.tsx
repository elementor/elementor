import * as React from 'react';
import { type ComponentInstanceHeaderProps } from '@elementor/editor-components';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieComponentInstanceHeaderAction = ( { componentId, elementId }: ComponentInstanceHeaderProps ) => (
	<AngieGenerateButton prompt={ ANGIE_PROMPTS.componentInstance( { componentId, elementId } ) } />
);
