import * as React from 'react';
import { PopoverScrollableContent as BasePopoverScrollableContent } from '@elementor/editor-ui';

import { useSectionWidth } from '../contexts/section-context';

type Props = React.ComponentProps< typeof BasePopoverScrollableContent >;

export const PopoverScrollableContent = ( props: Props ) => {
	const sectionWidth = useSectionWidth();

	return <BasePopoverScrollableContent { ...props } width={ sectionWidth } />;
};
