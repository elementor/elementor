import * as React from 'react';
import { Box, Chip, type ChipProps, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useReverseHtmlEntities } from '../../hooks/use-reverse-html-entities';
import { contentPanelListRowTitleSx } from '../panel/content-panel-chrome';

type StatusChipConfig = {
	color: ChipProps[ 'color' ];
	label: string;
};

const statusChipConfig: Record< string, StatusChipConfig > = {
	draft: {
		color: 'default',
		label: __( 'Draft', 'elementor' ),
	},
	future: {
		color: 'default',
		label: __( 'Scheduled', 'elementor' ),
	},
	pending: {
		color: 'warning',
		label: __( 'Pending Review', 'elementor' ),
	},
	private: {
		color: 'default',
		label: __( 'Private', 'elementor' ),
	},
};

export function getStatusChipConfig( status: string ): StatusChipConfig {
	const known = statusChipConfig[ status ];

	if ( known ) {
		return known;
	}

	return {
		color: 'default',
		label: status,
	};
}

const PageStatus = ( { status }: { status: string } ) => {
	if ( 'publish' === status ) {
		return null;
	}

	const { color, label } = getStatusChipConfig( status );

	return (
		<Chip
			color={ color }
			component="span"
			label={ label }
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
