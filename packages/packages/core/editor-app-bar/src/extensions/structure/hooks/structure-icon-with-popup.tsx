import * as React from 'react';
import { useEffect, useState } from 'react';
import { StructureIcon } from '@elementor/icons';
import { Button, Card, CardActions, CardContent, Infotip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

const extendedWindow = window as unknown as ExtendedWindow;

const StructurePopupContent = ( { onClose }: { onClose: () => void } ) => {
	const handleDismiss = async () => {
		onClose();

		extendedWindow.elementorCommon?.ajax?.addRequest?.( 'structure_popup_dismiss' ).catch( () => {} );
	};

	return (
		<Card elevation={ 0 } sx={ { maxWidth: 300 } }>
			<CardContent>
				<Typography variant="subtitle2" sx={ { mb: 2 } }>
					{ __( 'Refreshed Top Bar layout!', 'elementor' ) }
				</Typography>
				<Typography variant="body2">
					{ __( 'We’ve fine-tuned the Top Bar to make navigation faster and smoother.', 'elementor' ) }
				</Typography>
			</CardContent>
			<CardActions sx={ { pt: 0 } }>
				<Button
					size="small"
					color="secondary"
					href="https://go.elementor.com/editor-top-bar-learn/"
					target="_blank"
				>
					{ __( 'Learn More', 'elementor' ) }
				</Button>
				<Button size="small" variant="contained" onClick={ handleDismiss }>
					{ __( 'Got it', 'elementor' ) }
				</Button>
			</CardActions>
		</Card>
	);
};

export const StructureIconWithPopup = () => {
	const [ showPopup, setShowPopup ] = useState( false );

	useEffect( () => {
		if ( extendedWindow.elementorShowInfotip?.shouldShow === '1' ) {
			setShowPopup( true );
		}
	}, [] );

	const handleClosePopup = () => {
		setShowPopup( false );
	};

	if ( extendedWindow.elementorShowInfotip?.shouldShow !== '1' ) {
		return <StructureIcon />;
	}

	return (
		<Infotip
			placement="bottom"
			arrow={ false }
			content={ <StructurePopupContent onClose={ handleClosePopup } /> }
			open={ showPopup }
			PopperProps={ {
				modifiers: [
					{
						name: 'offset',
						options: { offset: [ -16, 12 ] },
					},
				],
			} }
		>
			<StructureIcon />
		</Infotip>
	);
};
