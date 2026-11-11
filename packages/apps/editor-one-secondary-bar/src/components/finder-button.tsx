import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	showLeadingDivider?: boolean;
};

export function FinderButton( { showLeadingDivider = false }: Props ) {
	return (
		<Box
			data-testid="editor-one-finder-slot"
			sx={ ( theme ) => ( {
				position: 'relative',
				width: 60,
				height: '100%',
				flexShrink: 0,
				display: 'grid',
				placeItems: 'center',
				...( showLeadingDivider && {
					'&::before': {
						content: '""',
						position: 'absolute',
						insetBlock: '11px',
						insetInlineStart: 0,
						width: '1px',
						backgroundColor: theme.palette.divider,
						pointerEvents: 'none',
					},
				} ),
			} ) }
		>
			<IconButton
				aria-label={ __( 'Finder', 'elementor' ) }
				disableRipple
				onClick={ () => window.$e?.route?.( 'finder' ) }
				sx={ {
					width: '100%',
					height: '100%',
					borderRadius: 0,
					'&:hover': {
						backgroundColor: 'transparent',
					},
				} }
			>
				<SearchIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
