import * as React from 'react';
import { type MouseEvent, type RefObject } from 'react';
import { CrownFilledIcon } from '@elementor/icons';
import {
	Alert,
	AlertAction,
	AlertTitle,
	Box,
	ClickAwayListener,
	Infotip,
	type InfotipProps,
	Typography,
} from '@elementor/ui';

type PromotionPopoverCardProps = {
	title: string;
	content: string;
	ctaUrl: string;
	ctaText?: string;
	onClose: ( e: MouseEvent ) => void;
};

type PromotionPopoverProps = React.PropsWithChildren<
	PromotionPopoverCardProps & {
		open: boolean;
		placement?: InfotipProps[ 'placement' ];
		slotProps?: InfotipProps[ 'slotProps' ];
		anchorRef?: RefObject< HTMLElement | null >;
	}
>;

export const PromotionPopover = ( {
	children,
	open,
	placement = 'right',
	slotProps,
	anchorRef,
	...cardProps
}: PromotionPopoverProps ) => {
	const anchorEl = anchorRef?.current;

	const defaultSlotProps: InfotipProps[ 'slotProps' ] = {
		popper: {
			...( anchorEl && { anchorEl } ),
			modifiers: [
				{
					name: 'offset',
					options: {
						offset: anchorRef ? [ 0, 4 ] : [ 0, 10 ],
					},
				},
			],
		},
	};

	return (
		<Infotip
			placement={ placement }
			arrow={ false }
			content={ <PopoverAlert { ...cardProps } /> }
			open={ open }
			slotProps={ slotProps || defaultSlotProps }
		>
			{ children }
		</Infotip>
	);
};

function PopoverAlert( { title, content, ctaUrl, ctaText, onClose }: PromotionPopoverCardProps ) {
	return (
		<ClickAwayListener
			disableReactTree={ true }
			mouseEvent="onMouseDown"
			touchEvent="onTouchStart"
			onClickAway={ onClose }
		>
			<Alert
				variant="standard"
				color="promotion"
				icon={ <CrownFilledIcon fontSize="tiny" /> }
				onClose={ onClose }
				role="dialog"
				aria-label="promotion-popover-title"
				action={
					ctaText ? (
						<AlertAction
							variant="contained"
							color="promotion"
							href={ ctaUrl }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ ctaText }
						</AlertAction>
					) : null
				}
				sx={ { maxWidth: 296 } }
			>
				<Box sx={ { gap: 0.5, display: 'flex', flexDirection: 'column' } }>
					<AlertTitle>{ title }</AlertTitle>
					<Typography variant="body2">{ content }</Typography>
				</Box>
			</Alert>
		</ClickAwayListener>
	);
}
