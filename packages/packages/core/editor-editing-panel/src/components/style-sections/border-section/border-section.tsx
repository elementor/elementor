import * as React from 'react';

import { SectionContent } from '../../section-content';
import { BorderColorField } from './border-color-field';
import { BorderRadiusField } from './border-radius-field';
import { BorderStyleField } from './border-style-field';
import { BorderWidthField } from './border-width-field';

export const BorderSection = () => (
	<SectionContent>
		<BorderWidthField />
		<BorderColorField />
		<BorderStyleField />
		<BorderRadiusField />
	</SectionContent>
);
