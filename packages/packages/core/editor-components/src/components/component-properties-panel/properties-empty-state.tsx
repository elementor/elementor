import * as React from 'react';
import { ComponentPropListIcon } from '@elementor/icons';
import { Link, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const LEARN_MORE_URL = 'https://go.elementor.com/tbd/';

export function PropertiesEmptyState() {
	return (
		<Stack
			alignItems="center"
			justifyContent="flex-start"
			height="100%"
			color="text.secondary"
			sx={ { px: 2.5, pt: 10, pb: 5.5 } }
			gap={ 1 }
		>
			<ComponentPropListIcon fontSize="large" />

			<Typography align="center" variant="subtitle2">
				{ __( 'Add your first property', 'elementor' ) }
			</Typography>

			<Typography align="center" variant="caption">
				{ __( 'Make instances flexible while keeping design synced.', 'elementor' ) }
			</Typography>

			<Typography align="center" variant="caption">
				{ __( 'Select any element, then click + next to a setting to expose it.', 'elementor' ) }
			</Typography>

			<Link
				variant="caption"
				color="secondary"
				href={ LEARN_MORE_URL }
				target="_blank"
				rel="noopener noreferrer"
				sx={ { textDecorationLine: 'underline' } }
			>
				{ __( 'Learn more', 'elementor' ) }
			</Link>
		</Stack>
	);
}
