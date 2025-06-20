import * as React from 'react';

import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { BorderField } from './border-field';
import { BorderRadiusField } from './border-radius-field';

export const BorderSection = () => (
	<SectionContent>
		<BorderRadiusField />
		<PanelDivider />
		<BorderField />
	</SectionContent>
);
