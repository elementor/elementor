import * as React from 'react';
import { type ComponentType, type ElementType as ReactElementType } from 'react';
import { useFloatingActionsBar } from '@elementor/editor-controls';
import { bindPopover, bindTrigger, IconButton, Popover, Tooltip, usePopupState } from '@elementor/ui';

const SIZE = 'tiny';

export type PopoverActionProps = {
	title: string;
	visible?: boolean;
	icon: ReactElementType;
	content: ComponentType< { close: () => void } >;
};

export function PopoverAction( { title, visible = true, icon: Icon, content: PopoverContent }: PopoverActionProps ) {
	const { popupState, triggerProps, popoverProps } = useFloatingActionsPopover();

	if ( ! visible ) {
		return null;
	}

	return (
		<>
			<Tooltip placement="top" title={ title }>
				<IconButton aria-label={ title } size={ SIZE } { ...triggerProps }>
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
				{ ...popoverProps }
			>
				<PopoverContent close={ popupState.close } />
			</Popover>
		</>
	);
}

export function useFloatingActionsPopover() {
	const { setOpen } = useFloatingActionsBar();
	const popupState = usePopupState( { variant: 'popover' } );

	const triggerProps = bindTrigger( popupState );
	const popoverProps = bindPopover( popupState );

	const onClick = ( e: React.MouseEvent ) => {
		triggerProps.onClick( e );
		setOpen( true );
	};

	const onClose = () => {
		popoverProps.onClose();
		setOpen( false );
	};

	const close = () => {
		popupState.close();
		setOpen( false );
	};

	return {
		popupState: { ...popupState, close },
		triggerProps: { ...triggerProps, onClick },
		popoverProps: { ...popoverProps, onClose },
	};
}
