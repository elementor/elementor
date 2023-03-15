import { Box, ToggleButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { Document } from '@elementor/documents';
import { openRoute, useRouteStatus } from '@elementor/v1-adapters';
import { SettingsIcon } from '@elementor/icons';

type Props = {
	type: Document['type']
}

export default function SettingsButton( { type }: Props ) {
	const { isActive, isBlocked } = useRouteStatus( 'panel/page-settings' );

	/* translators: %s: Post type label. */
	const title = __( '%s Settings', 'elementor' )
		.replace( '%s', type.label );

	return (
		<Tooltip title={ title }>
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span" aria-label={ undefined }>
				<ToggleButton
					value="document-settings"
					selected={ isActive }
					disabled={ isBlocked }
					onChange={ () => openRoute( 'panel/page-settings/settings' ) }
					aria-label={ title }
					size="small"
				>
					<SettingsIcon />
				</ToggleButton>
			</Box>
		</Tooltip>
	);
}
