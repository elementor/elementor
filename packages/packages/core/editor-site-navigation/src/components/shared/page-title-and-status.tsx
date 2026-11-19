import * as React from 'react';
import { Box, Chip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useReverseHtmlEntities } from '../../hooks/use-reverse-html-entities';
import { contentPanelListRowTitleSx } from '../panel/content-panel-chrome';

const statusLabels: Record< string, string > = {
	draft: __( 'Draft', 'elementor' ),
	future: __( 'Scheduled', 'elementor' ),
	pending: __( 'Pending', 'elementor' ),
	private: __( 'Private', 'elementor' ),
};

function getStatusLabel( status: string ): string {
	return statusLabels[ status ] ?? status;
}

const PageStatus = ( { status }: { status: string } ) => {
	if ( 'publish' === status ) {
		return null;
	}

	return (
		<Chip
			component="span"
			label={ getStatusLabel( status ) }
			size="tiny"
			sx={ { flexShrink: 0, ml: 0.5, textTransform: 'capitalize' } }
			variant="standard"
		/>
	);
};

const PageTitle = ( { title }: { title: string } ) => {
	const modifiedTitle = useReverseHtmlEntities( title );

	return (
		<Typography
			component="span"
			variant="body2"
			color="text.secondary"
			noWrap
			sx={ {
				...contentPanelListRowTitleSx,
				flexBasis: 'auto',
			} }
		>
			{ modifiedTitle }
		</Typography>
	);
};

export default function PageTitleAndStatus( { title, status }: { title: string; status: string } ) {
	return (
		<Box alignItems="center" display="flex" minWidth={ 0 }>
			<PageTitle title={ title } />
			<PageStatus status={ status } />
		</Box>
	);
}