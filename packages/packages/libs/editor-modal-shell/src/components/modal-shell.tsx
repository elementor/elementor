import * as React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Box, CloseButton, Dialog, type SxProps, type Theme } from '@elementor/ui';

export const MODAL_Z_INDEX = 99999;

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 400;
const DEFAULT_REVEAL_DURATION_MS = 500;
const DEFAULT_REVEAL_DELAY_MS = 0;

type CloseReason = 'escapeKeyDown' | 'backdropClick';

type ModalShellContextValue = {
	close: () => void;
};

const ModalShellContext = createContext< ModalShellContextValue | null >( null );

export const useModalShell = (): ModalShellContextValue => {
	const ctx = useContext( ModalShellContext );

	if ( ! ctx ) {
		throw new Error( 'useModalShell must be used inside a <ModalShell />' );
	}

	return ctx;
};

export type ModalShellProps = {
	children: ReactNode;
	onClose?: () => void;
	revealDuration?: number;
	revealDelay?: number;
	container?: HTMLElement;
	sx?: SxProps< Theme >;
	closeOnEsc?: boolean;
	closeOnOutsideClick?: boolean;
	backdrop?: boolean;
	backdropSx?: SxProps< Theme >;
};

export const ModalShell = ( {
	children,
	onClose,
	revealDuration = DEFAULT_REVEAL_DURATION_MS,
	revealDelay = DEFAULT_REVEAL_DELAY_MS,
	container,
	sx = {},
	closeOnEsc = true,
	closeOnOutsideClick = true,
	backdrop = true,
	backdropSx = {},
}: ModalShellProps ) => {
	const portalTarget = container ?? ( typeof document !== 'undefined' ? document.body : undefined );
	const consumerOwnsEnter = revealDuration === 0;
	const [ open, setOpen ] = useState( true );

	const startClose = useCallback( () => setOpen( false ), [] );

	const contextValue = useMemo< ModalShellContextValue >( () => ( { close: startClose } ), [ startClose ] );

	const handleDialogClose = ( _event: object, reason: CloseReason ) => {
		if ( reason === 'escapeKeyDown' && ! closeOnEsc ) {
			return;
		}

		if ( reason === 'backdropClick' && ! closeOnOutsideClick ) {
			return;
		}

		startClose();
	};

	const animationProps = useMemo(
		() =>
			consumerOwnsEnter
				? {}
				: {
						animation: `e-modal-shell-reveal ${ revealDuration }ms ease ${ revealDelay }ms backwards`,
						'@keyframes e-modal-shell-reveal': {
							from: { opacity: 0, transform: 'scale(0.95)' },
							to: { opacity: 1, transform: 'scale(1)' },
						},
				  },
		[ consumerOwnsEnter, revealDuration, revealDelay ]
	);

	return (
		<Dialog
			open={ open }
			maxWidth={ false }
			onClose={ handleDialogClose }
			container={ portalTarget }
			disableEscapeKeyDown={ ! closeOnEsc }
			hideBackdrop={ ! backdrop }
			TransitionProps={ {
				onExited: onClose,
				...( consumerOwnsEnter && { timeout: { enter: 0 } } ),
			} }
			slotProps={ {
				backdrop: {
					...( consumerOwnsEnter && { transitionDuration: { enter: 0 } } ),
					sx: backdropSx,
				},
			} }
			PaperProps={ {
				sx: {
					width: DEFAULT_WIDTH,
					height: DEFAULT_HEIGHT,
					maxWidth: '100%',
					overflow: 'hidden',
					...animationProps,
					'@media (prefers-reduced-motion: reduce)': {
						animation: 'none',
					},
					...sx,
				},
			} }
			sx={ {
				zIndex: MODAL_Z_INDEX,
			} }
		>
			<ModalShellContext.Provider value={ contextValue }>
				<Box sx={ { display: 'contents' } }>
					{ children }
					<CloseButton
						onClick={ startClose }
						sx={ {
							position: 'absolute',
							right: 16,
							top: 16,
							zIndex: 3,
						} }
					/>
				</Box>
			</ModalShellContext.Provider>
		</Dialog>
	);
};
