import * as React from 'react';
import { Box, Typography } from '@elementor/ui';

import { useReverseHtmlEntities } from '../../hooks/use-reverse-html-entities';
import { contentPanelListRowTitleSx } from '../panel/content-panel-chrome';

const PageStatus = ( { status }: { status: string } ) => {
	if ( 'publish' === status ) {
		return null;
	}

	return (
		<Typography
			component="span"
			variant="body2"
			color="text.secondary"
			sx={ {
				...contentPanelListRowTitleSx,
				textTransform: 'capitalize',
				fontStyle: 'italic',
				whiteSpace: 'nowrap',
				flexBasis: 'content',
			} }
		>
			({ status })
		</Typography>
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
		<Box display="flex">
			<PageTitle title={ title } />
			&nbsp;
			<PageStatus status={ status } />
		</Box>
	);
}
