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
	newItemIndex,
}: {
	disabled?: boolean;
	tooltip?: boolean;
	tooltipContent?: React.ReactNode;
	newItemIndex?: number;
} ) => {
	const { addItem } = useRepeaterContext();
	const shouldShowTooltip = tooltip && tooltipContent;

	const onClick = () => addItem( { index: newItemIndex } );

	return (
		<ConditionalToolTip content={ tooltipContent } shouldShowTooltip={ !! shouldShowTooltip }>
			<IconButton
				size={ SIZE }
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
