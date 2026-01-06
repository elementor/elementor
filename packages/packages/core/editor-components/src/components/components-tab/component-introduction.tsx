import * as React from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { PopoverHeader } from '@elementor/editor-ui';
import { Box, Button, Image, Link, Popover, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const ComponentIntroduction = ( {
	anchorRef,
	shouldShowIntroduction,
	onClose,
}: {
	anchorRef: React.RefObject< HTMLElement >;
	shouldShowIntroduction: boolean;
	onClose: () => void;
} ) => {
	if ( ! anchorRef.current || ! shouldShowIntroduction ) {
		return null;
	}

	return (
		<Popover
			anchorEl={ anchorRef.current }
			open={ shouldShowIntroduction }
			anchorOrigin={ {
				vertical: 'top',
				horizontal: 'right',
			} }
			transformOrigin={ {
				vertical: 'top',
				horizontal: -30,
			} }
			onClose={ onClose }
		>
			<Box sx={ { width: '296px' } }>
				<PopoverHeader title={ __( 'Add your first property', 'elementor' ) } onClose={ onClose } />
				<Image
					sx={ { width: '296px', height: '160px' } }
					src={ 'https://assets.elementor.com/packages/v1/images/components-properties-intro.png' }
					alt={ '' }
				/>
				<PopoverContent>
					<Stack sx={ { p: 2 } }>
						<Typography variant={ 'body2' }>
							{ __( 'Properties make instances flexible.', 'elementor' ) }
						</Typography>
						<Typography variant={ 'body2' }>
							{ __(
								'Click next to any setting you want users to customize - like text, images, or links.',
								'elementor'
							) }
						</Typography>
						<Typography variant={ 'body2' } sx={ { mt: 2 } }>
							{ __(
								'Your properties will appear in the Properties panel, where you can organize and manage them anytime.',
								'elementor'
							) }
						</Typography>
						<Link
							href="http://go.elementor.com/components-guide"
							target="_blank"
							sx={ { mt: 2 } }
							color="info.main"
							variant="body2"
						>
							{ __( 'Learn more', 'elementor' ) }
						</Link>
						<Stack direction="row" alignItems="center" justifyContent="flex-end" sx={ { pt: 1 } }>
							<Button size="medium" variant="contained" onClick={ onClose }>
								{ __( 'Got it', 'elementor' ) }
							</Button>
						</Stack>
					</Stack>
				</PopoverContent>
			</Box>
		</Popover>
	);
};
