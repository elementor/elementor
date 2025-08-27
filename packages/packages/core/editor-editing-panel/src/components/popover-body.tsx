import * as React from 'react';
import { PopoverBody as BasePopoverBody } from '@elementor/editor-ui';

import { useSectionWidth } from '../contexts/section-context';

type Props = React.ComponentProps< typeof BasePopoverBody >;

export const PopoverBody = ( props: Props ) => {
	const sectionWidth = useSectionWidth();

	return <BasePopoverBody { ...props } width={ sectionWidth } />;
};
