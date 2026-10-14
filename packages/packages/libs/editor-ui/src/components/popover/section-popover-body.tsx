import * as React from 'react';
import { type ComponentProps } from 'react';

import { useSectionWidth } from '../../contexts/section-context';
import { PopoverBody as BasePopoverBody } from './body';

export const SectionPopoverBody = ( props: ComponentProps< typeof BasePopoverBody > ) => {
	const sectionWidth = useSectionWidth();

	return <BasePopoverBody { ...props } width={ sectionWidth } />;
};
