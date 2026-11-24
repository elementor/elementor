import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, IconButton, type Theme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export function FinderButton() {
	return (
		<Box
			data-testid="editor-one-finder-slot"
			sx={ {
				position: 'relative',
				height: '100%',
				flexShrink: 0,
				display: 'flex',
				alignItems: 'center',
				paddingInlineStart: '27px',
				paddingInlineEnd: '16px',
			} }
		>
			<Box
				aria-hidden="true"
				data-testid="editor-one-finder-divider"
				sx={ ( theme: Theme ) => ( {
					position: 'absolute',
					insetInlineStart: '16px',
					insetBlockStart: '50%',
					transform: 'translateY( -50% )',
					width: '1px',
					height: '20px',
					backgroundColor: theme.palette.divider,
					pointerEvents: 'none',
				} ) }
			/>
			<IconButton
				aria-label={ __( 'Finder', 'elementor' ) }
				disableRipple
				onClick={ () => window.$e?.route?.( 'finder' ) }
				sx={ {
					padding: 0,
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
