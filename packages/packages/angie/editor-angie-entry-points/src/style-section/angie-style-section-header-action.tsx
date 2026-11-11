import * as React from 'react';
import { type StyleSectionHeaderProps } from '@elementor/editor-editing-panel';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieStyleSectionHeaderAction = ( { elementId, sectionName }: StyleSectionHeaderProps ) => (
	<AngieGenerateButton prompt={ ANGIE_PROMPTS.styleSection( { elementId, sectionName } ) } />
);
