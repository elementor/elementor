import * as React from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { PopoverHeader } from '@elementor/editor-ui';
import { bindPopover, bindTrigger, Box, Button, Image, Popover, Stack, Typography, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const MESSAGE_KEY = 'components-properties-introduction';

export const ComponentIntroduction = ( {
	showMessage = false,
	setShowMessage,
}: {
	showMessage?: boolean;
	setShowMessage?: ( showMessage: boolean ) => void;
} ) => {
	const [ isMessageSuppressed, suppressMessage ] = useSuppressedMessage( MESSAGE_KEY );
	const [ shouldShowIntroduction, setShouldShowIntroduction ] = React.useState( ! isMessageSuppressed );
	const anchorRef = React.useRef< HTMLDivElement >( null );
	const componentIntroductionPopover = usePopupState( {
		variant: 'popover',
		popupId: 'component-introduction-popover',
	} );

	const handleClose = () => {
		if ( ! isMessageSuppressed ) {
			suppressMessage();
		}

		setShouldShowIntroduction( false );
		setShowMessage?.( false );
		componentIntroductionPopover.close();
	};

	React.useEffect( () => {
		if (
			( anchorRef.current && shouldShowIntroduction && ! isMessageSuppressed ) ||
			( anchorRef.current && showMessage )
		) {
			componentIntroductionPopover.open();
		}
	}, [ anchorRef.current, shouldShowIntroduction, isMessageSuppressed, showMessage ] );

	return (
		<>
			<Box ref={ anchorRef }>
				<Box { ...bindTrigger( componentIntroductionPopover ) }>
					<Popover
						anchorOrigin={ {
							vertical: 'top',
							horizontal: 'left',
						} }
						transformOrigin={ {
							vertical: -10,
							horizontal: -10,
						} }
						{ ...bindPopover( componentIntroductionPopover ) }
						onClose={ () => {
							componentIntroductionPopover.close();
							handleClose();
						} }
					>
						<IntroductionContent handleClose={ handleClose } />
					</Popover>
				</Box>
			</Box>
		</>
	);
};

const IntroductionContent = ( { handleClose }: { handleClose: () => void } ) => {
	return (
		<Box sx={ { width: '296px' } }>
			<PopoverHeader title={ __( 'Add your first property', 'elementor' ) } onClose={ handleClose } />
			<Image
				sx={ { width: '296px', height: '160px' } }
				src={ 'https://assets.elementor.com/packages/v1/images/class-manager-intro.svg' }
				alt={ '' }
			/>
			<PopoverContent>
				<Stack gap={ 1 } sx={ { p: 2 } }>
					<Typography variant={ 'body2' }>
						{ __( 'Properties make instances flexible.', 'elementor' ) }
					</Typography>
					<Typography variant={ 'body2' }>
						{ __(
							'Click next to any setting you want users to customize - like text, images, or links.',
							'elementor'
						) }
					</Typography>
					<Typography variant={ 'body2' }>
						{ __(
							'Your properties will appear in the Properties panel, where you can organize and manage them anytime.',
							'elementor'
						) }
					</Typography>
					<Stack direction="row" alignItems="center" justifyContent="flex-end">
						<Button size="medium" variant="contained" onClick={ handleClose }>
							{ __( 'Got it', 'elementor' ) }
						</Button>
					</Stack>
				</Stack>
			</PopoverContent>
		</Box>
	);
};
