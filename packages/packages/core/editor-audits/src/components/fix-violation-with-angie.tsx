import * as React from 'react';
import { isAngieAvailable, sendPromptToAngie } from '@elementor/editor-mcp';
import { AngieIcon } from '@elementor/icons';
import { Button, IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ANGIE_FIX_ENTRY_POINT, CREATE_WIDGET_EVENT } from '../constants';

type Props = {
	prompt: string;
	panelZIndex: number;
	variant?: 'icon' | 'button';
};

export default function FixViolationWithAngie( { prompt, panelZIndex, variant = 'icon' }: Props ) {
	const label = __( 'Fix with Angie', 'elementor' );
	const href = `#angie-prompt=${ encodeURIComponent( prompt ) }`;

	const handleClick = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		event.stopPropagation();
		event.preventDefault();

		if ( isAngieAvailable() ) {
			sendPromptToAngie( prompt );
			return;
		}

		window.dispatchEvent(
			new CustomEvent( CREATE_WIDGET_EVENT, {
				detail: {
					entry_point: ANGIE_FIX_ENTRY_POINT,
					prompt,
				},
			} )
		);
	};

	if ( variant === 'button' ) {
		return (
			<Button
				component="a"
				href={ href }
				size="small"
				color="secondary"
				variant="outlined"
				startIcon={ <AngieIcon fontSize="tiny" aria-hidden={ true } /> }
				onClick={ handleClick }
			>
				{ label }
			</Button>
		);
	}

	return (
		<Tooltip title={ label } placement="top" PopperProps={ { sx: { zIndex: panelZIndex } } }>
			<IconButton component="a" href={ href } size="small" aria-label={ label } onClick={ handleClick }>
				<AngieIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
}
