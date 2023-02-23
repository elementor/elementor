import { ToggleButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { Document } from '../../types';
import { openRoute, useRouteStatus } from '@elementor/v1-adapters';
import CogIcon from '../../icons/cog-icon';

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
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<span>
				<ToggleButton
					value="document-settings"
					selected={ isActive }
					disabled={ isBlocked }
					onChange={ () => openRoute( 'panel/page-settings/settings' ) }
				>
					<CogIcon />
				</ToggleButton>
			</span>
		</Tooltip>
	);
}
