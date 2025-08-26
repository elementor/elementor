import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { Box, IconButton, Infotip } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export type TooltipAddItemActionProps = {
	disabled?: boolean;
	enableTooltip?: boolean;
	tooltipContent?: React.ReactNode;
	newItemIndex?: number;
	labelName?: string;
};

export const TooltipAddItemAction = ( {
	disabled = false,
	enableTooltip = false,
	tooltipContent = null,
	newItemIndex,
	labelName,
}: TooltipAddItemActionProps ) => {
	const { addItem } = useRepeaterContext();

	const onClick = ( ev: React.MouseEvent ) => addItem( ev, { index: newItemIndex } );

	return (
		<ConditionalToolTip content={ tooltipContent } enable={ enableTooltip }>
			<Box component="span" sx={ { cursor: disabled ? 'not-allowed' : 'pointer' } }>
				<IconButton
					size={ SIZE }
					disabled={ disabled }
					onClick={ onClick }
					// Translators: %s is the number of kits in the results
					aria-label={ sprintf( __( 'add %1$s item', 'elementor' ), labelName?.toLowerCase() ) }
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
} > ) =>
	enable && content ? (
		<Infotip placement="right" color="secondary" content={ content }>
			{ children }
		</Infotip>
	) : (
		children
	);
