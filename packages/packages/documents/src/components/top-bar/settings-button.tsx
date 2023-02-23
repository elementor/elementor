import { ToggleButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { Document } from '../../types';
import { openRoute, useRouteStatus } from '@elementor/v1-adapters';
import { SettingsIcon } from '@elementor/icons';

type Props = {
	type: Document['type']
}

export default function SettingsButton( { type }: Props ) {
	const { isActive, isBlocked } = useRouteStatus( 'panel/page-settings' );

	/* translators: %s: Post type label. */
	const title = __( '%s settings', 'elementor' )
		.replace( '%s', type.label );

	return (
		<Tooltip title={ title }>
			<ToggleButton
				value="document-settings"
				selected={ isActive }
				disabled={ isBlocked }
				onChange={ () => openRoute( 'panel/page-settings/settings' ) }
				size="small"
			>
				<SettingsIcon />
			</ToggleButton>
		</Tooltip>
	);
}
