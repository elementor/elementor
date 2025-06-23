import * as React from 'react';
import { type ComponentType, type ElementType as ReactElementType, useId } from 'react';
import { bindPopover, bindToggle, IconButton, Popover, Tooltip, usePopupState } from '@elementor/ui';

const SIZE = 'tiny';

export type PopoverActionProps = {
	title: string;
	visible?: boolean;
	icon: ReactElementType;
	content: ComponentType< { close: () => void } >;
};

export default function PopoverAction( {
	title,
	visible = true,
	icon: Icon,
	content: PopoverContent,
}: PopoverActionProps ) {
	const id = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-popover-action-${ id }`,
	} );

	if ( ! visible ) {
		return null;
	}

	return (
		<>
			<Tooltip placement="top" title={ title }>
				<IconButton aria-label={ title } key={ id } size={ SIZE } { ...bindToggle( popupState ) }>
					<Icon fontSize={ SIZE } />
				</IconButton>
			</Tooltip>
			<Popover
				disablePortal
				disableScrollLock
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				PaperProps={ {
					sx: { my: 2.5 },
				} }
				{ ...bindPopover( popupState ) }
			>
				<PopoverContent close={ popupState.close } />
			</Popover>
		</>
	);
}
