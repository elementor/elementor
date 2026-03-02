import * as React from 'react';
import { type ReactNode } from 'react';
import { XIcon } from '@elementor/icons';
import { Box, Dialog, DialogContent, IconButton, Stack } from '@elementor/ui';

type V4ActivationModalProps = {
	onClose: () => void;
	header: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
	rightPanel?: ReactNode;
	rightPanelBackgroundColor?: string;
};

export const V4ActivationModal = ( {
	onClose,
	header,
	children,
	footer,
	rightPanel,
	rightPanelBackgroundColor = 'transparent',
}: V4ActivationModalProps ) => {
	return (
		<Dialog
			open
			fullWidth
			maxWidth="lg"
			onClose={ onClose }
			PaperProps={ {
				sx: {
					maxHeight: 680,
					minHeight: 480,
					height: '100%',
				},
			} }
			sx={ {
				zIndex: 99999,
			} }
		>
			<DialogContent
				sx={ {
					p: 0,
					height: '100%',
					position: 'relative',
				} }
			>
				<IconButton
					onClick={ onClose }
					sx={ {
						position: 'absolute',
						right: 16,
						top: 16,
						zIndex: 3,
					} }
				>
					<XIcon sx={ { color: 'common.black' } } />
				</IconButton>

				<Stack direction="row" width="100%" height="100%">
					<Stack
						justifyContent="space-between"
						alignItems="flex-start"
						sx={ {
							flexShrink: 1,
							flexBasis: '41%',
							py: 5,
							px: 4,
						} }
						gap={ 3 }
					>
						{ header }
						{ children }
						{ footer }
					</Stack>

					<Box
						sx={ {
							flexShrink: 1,
							flexBasis: '59%',
							display: 'flex',
							position: 'relative',
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: rightPanelBackgroundColor,
						} }
					>
						{ rightPanel }
					</Box>
				</Stack>
			</DialogContent>
		</Dialog>
	);
};
