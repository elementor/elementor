import * as React from 'react';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Card, CardContent, CardHeader, Infotip, Typography } from '@elementor/ui';
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
	const NON_ADMIN_TITLE_TEXT = __( "Sorry, you can't upload that file yet", 'elementor' );
	const NON_ADMIN_CONTENT_TEXT = __(
		'To upload them anyway, ask the site administrator to enable unfiltered file uploads.',
		'elementor'
	);

	return (
		<Card elevation={ 0 } sx={ { maxWidth: 400, backgroundColor: '#F3F3F4' } }>
			<CardHeader title={ NON_ADMIN_TITLE_TEXT } avatar={ <InfoCircleFilledIcon color={ 'secondary' } /> } />
			<CardContent>
				<Typography variant="body1">{ NON_ADMIN_CONTENT_TEXT }</Typography>
			</CardContent>
		</Card>
	);
}
