import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { Box, IconButton, Infotip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const TooltipAddItemAction = ( {
	disabled = false,
	enableTooltip = false,
	tooltipContent = null,
	newItemIndex,
}: {
	disabled?: boolean;
	enableTooltip?: boolean;
	tooltipContent?: React.ReactNode;
	newItemIndex?: number;
} ) => {
	const { addItem } = useRepeaterContext();

	const onClick = () => addItem( { index: newItemIndex } );

	return (
		<ConditionalToolTip content={ tooltipContent } enable={ enableTooltip }>
			<Box sx={ { ml: 'auto' } }>
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
} > ) =>
	enable && content ? (
		<Infotip
			placement="right"
			content={
				<Box
					component="span"
					aria-label={ undefined }
					sx={ { display: 'flex', gap: 0.5, p: 2, width: 320, borderRadius: 1 } }
				>
					{ content }
				</Box>
			}
		>
			{ children }
		</Infotip>
	) : (
		children
	);
