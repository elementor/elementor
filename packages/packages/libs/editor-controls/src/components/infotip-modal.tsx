import * as React from 'react';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Card, CardContent, CardHeader, Typography } from '@elementor/ui';
import Infotip from '@elementor/ui/Infotip';
import { __ } from '@wordpress/i18n';

type InfotipModalProps = {
	open: boolean;
	onClose: ( enabled: boolean ) => void;
	children: React.ReactNode;
};

export const InfotipModal = ( props: InfotipModalProps ) => {
	return (
		<Infotip placement="right" content={ <InfotipCard /> }>
			{ props.children }
		</Infotip>
	);
};
function InfotipCard() {
	const NON_ADMIN_TITLE_TEXT = __( "Sorry, you can't upload that file yet.", 'elementor' );
	const NON_ADMIN_CONTENT_TEXT = __(
		'To upload it anyway,\nask the site administrator to enable\nunfiltered file uploads.',
		'elementor'
	);

	return (
		<Card elevation={ 0 } sx={ { maxWidth: 400 } } color={ 'error' }>
			<CardHeader title={ NON_ADMIN_TITLE_TEXT } avatar={ <InfoCircleFilledIcon color={ 'secondary' } /> } />
			<CardContent sx={ { paddingTop: '1px' } }>
				<Typography variant="body1" sx={ { whiteSpace: 'pre-line' } }>
					{ NON_ADMIN_CONTENT_TEXT }
				</Typography>
			</CardContent>
		</Card>
	);
}
