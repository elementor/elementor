import * as React from 'react';
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '@elementor/icons';
import { Box, Dialog, DialogContent, IconButton, Stack } from '@elementor/ui';

const CONTENT_DELAY_MS = 2500;

type V4ActivationModalProps = {
	onClose: () => void;
	header: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
	rightPanel?: ReactNode;
	rightPanelBackgroundColor?: string;
	backgroundElement?: ReactNode;
};

export const V4ActivationModal = ( {
	onClose,
	header,
	children,
	footer,
	rightPanel,
	rightPanelBackgroundColor = 'transparent',
	backgroundElement,
}: V4ActivationModalProps ) => {
	return (
		<>
			{ backgroundElement && createPortal( backgroundElement, document.body ) }

			<Dialog
				open
				maxWidth={ false }
				onClose={ onClose }
				PaperProps={ {
					sx: {
						width: 955,
						maxWidth: '100%',
						overflow: 'hidden',
						opacity: 0,
						transform: 'scale(0.95)',
						animation: `v4-modal-reveal 0.5s ease ${ CONTENT_DELAY_MS }ms forwards`,
						'@keyframes v4-modal-reveal': {
							to: { opacity: 1, transform: 'scale(1)' },
						},
					},
				} }
				BackdropProps={ {
					sx: {
						backgroundColor: 'transparent',
					},
				} }
				sx={ {
					zIndex: 99999,
				} }
			>
				<DialogContent
					sx={ {
						p: 0,
						position: 'relative',
					} }
				>
					<Stack direction="row" width="100%" height={ 481 }>
						<Stack
							justifyContent="space-between"
							alignItems="flex-start"
							sx={ {
								width: 420,
								flexShrink: 0,
								py: 3.75,
								px: 3,
								bgcolor: 'background.paper',
							} }
						>
							{ header }
							{ children }
							{ footer }
						</Stack>

						<Box
							sx={ {
								flex: 1,
								display: 'flex',
								position: 'relative',
								justifyContent: 'center',
								alignItems: 'center',
								overflow: 'hidden',
								backgroundColor: rightPanelBackgroundColor,
							} }
						>
							{ rightPanel }
							<IconButton
								onClick={ onClose }
								sx={ {
									position: 'absolute',
									right: 14,
									top: 16,
									zIndex: 3,
								} }
							>
								<XIcon sx={ { color: 'common.black' } } />
							</IconButton>
						</Box>
					</Stack>
				</DialogContent>
			</Dialog>
		</>
	);
};
