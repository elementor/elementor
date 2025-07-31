import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { Box, IconButton, Infotip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const AddItemAction = ( {
	disabled = false,
	content,
	enableTooltip = false,
}: {
	disabled?: boolean;
	enableTooltip?: boolean;
	content?: React.ReactNode;
} ) => {
	const { addItem } = useRepeaterContext();

	const onClick = () => addItem();

	return (
		<ConditionalToolTip content={ content } enable={ enableTooltip }>
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
