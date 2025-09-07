import * as React from 'react';
import { useState } from 'react';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Typography } from '@elementor/ui';
import Infotip from '@elementor/ui/Infotip';
import { __ } from '@wordpress/i18n';

import { useUpdateUnfilteredFilesUpload } from '../hooks/use-unfiltered-files-upload';

type InfotipModalProps = {
	open: boolean;
	onClose: ( enabled: boolean ) => void;
	children: React.ReactNode;
};

export const InfotipModal = ( props: InfotipModalProps ) => {
	const { mutateAsync, isPending } = useUpdateUnfilteredFilesUpload();
	const { canUser } = useCurrentUserCapabilities();
	const [ isError, setIsError ] = useState( false );
	const canManageOptions = canUser( 'manage_options' );

	const onClose = ( enabled: boolean ) => {
		props.onClose( enabled );
		setTimeout( () => setIsError( false ), 300 );
	};

	const handleEnable = async () => {
		try {
			const response = await mutateAsync( { allowUnfilteredFilesUpload: true } );
			if ( response?.data?.success === false ) {
				setIsError( true );
			} else {
				props.onClose( true );
			}
		} catch {
			setIsError( true );
		}
	};

	return (
		<Infotip
			placement="right"
			content={
				<InfotipCard
					// canManageOptions={ canManageOptions }
					// isPending={ isPending }
					// isError={ isError }
					// onClose={ onClose }
					// handleEnable={ handleEnable }
				/>
			}
		>
			{ props.children }
		</Infotip>
	);
};

// type InfotipCardProps = {
// 	canManageOptions: boolean;
// 	isPending: boolean;
// 	isError: boolean;
// 	onClose: ( enabled: boolean ) => void;
// 	handleEnable: () => void;
// };

function InfotipCard() {
	const NON_ADMIN_TITLE_TEXT = __( "Sorry, you can't upload that file yet.", 'elementor' );
	const NON_ADMIN_CONTENT_TEXT = __(
		'To upload it anyway,\nask the site administrator to enable\nunfiltered file uploads.',
		'elementor'
	);

	return (
		<Card elevation={ 0 } sx={ { maxWidth: 300 } }>
			<CardHeader title={ NON_ADMIN_TITLE_TEXT } subheader="" />
			<CardContent>
				<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
					{ NON_ADMIN_CONTENT_TEXT }
				</Typography>
			</CardContent>
		</Card>
	);
}
