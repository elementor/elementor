import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const AddItemAction = ( {
	disabled = false,
	tooltip = false,
	tooltipContent = null,
}: {
	disabled?: boolean;
	tooltip?: boolean;
	tooltipContent?: React.ReactNode;
} ) => {
	const { addItem } = useRepeaterContext();
	const shouldShowTooltip = tooltip && tooltipContent;

	const onClick = () => addItem();

	return (
		<ConditionalToolTip content={ tooltipContent } shouldShowTooltip={ !! shouldShowTooltip }>
			<IconButton
				size={ SIZE }
				sx={ { ml: 'auto' } }
				disabled={ disabled }
				onClick={ onClick }
				aria-label={ __( 'Add item', 'elementor' ) }
			>
				<PlusIcon fontSize={ SIZE } />
			</IconButton>
		</ConditionalToolTip>
	);
};

const ConditionalToolTip = ( {
	children,
	content,
	shouldShowTooltip,
}: React.PropsWithChildren< {
	content: React.ReactNode;
	shouldShowTooltip: boolean;
} > ) => {
	return shouldShowTooltip ? <Tooltip title={ content }>{ children }</Tooltip> : children;
};
