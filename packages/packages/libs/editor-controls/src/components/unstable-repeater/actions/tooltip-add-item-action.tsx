import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { Box, IconButton, Infotip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export type TooltipAddItemActionProps = {
	disabled?: boolean;
	enableTooltip?: boolean;
	tooltipContent?: React.ReactNode;
	newItemIndex?: number;
};

export const TooltipAddItemAction = ( {
	disabled = false,
	enableTooltip = false,
	tooltipContent = null,
	newItemIndex,
}: TooltipAddItemActionProps ) => {
	const { addItem } = useRepeaterContext();

	const onClick = ( ev: React.MouseEvent ) => addItem( ev, { index: newItemIndex } );

	return (
		<ConditionalToolTip content={ tooltipContent } enable={ enableTooltip }>
			<Box sx={ { ml: 'auto', cursor: disabled ? 'not-allowed' : 'pointer' } }>
				<IconButton
					size={ SIZE }
					disabled={ disabled }
					onClick={ onClick }
					aria-label={ __( 'Add item', 'elementor' ) }
				>
					<PlusIcon fontSize={ SIZE } />
				</IconButton>
			</Box>
		</ConditionalToolTip>
	);
};

const ConditionalToolTip = ( {
	children,
	enable,
	content,
}: React.PropsWithChildren< {
	content?: React.ReactNode;
	enable: boolean;
	wrapContent?: boolean;
} > ) =>
	enable && content ? (
		<Infotip placement="right" color="secondary" content={ content }>
			{ children }
		</Infotip>
	) : (
		children
	);
