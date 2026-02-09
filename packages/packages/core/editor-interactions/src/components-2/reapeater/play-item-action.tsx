import * as React from 'react';
import { PlayerPlayIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const PlayItemAction = () => {
	return (
		<Tooltip key="preview" title={ __( 'Preview', 'elementor' ) } placement="top">
			<IconButton
				aria-label={ __( 'Play interaction', 'elementor' ) }
				size="tiny"
				// onClick={ () => onPlayInteraction( extractString( value.value.interaction_id ) ) }
			>
				<PlayerPlayIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
