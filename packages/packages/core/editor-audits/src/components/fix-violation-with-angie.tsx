import * as React from 'react';
import { isAngiePluginActive, sendPromptToAngie } from '@elementor/editor-mcp';
import { AngieIcon } from '@elementor/icons';
import { Button, IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditMeta } from '../types';
import { trackFindingClicked } from '../utils/tracking';

type Props = {
	audit: AuditMeta;
	prompt: string;
	panelZIndex: number;
	variant?: 'icon' | 'button';
};

export default function FixViolationWithAngie( { audit, prompt, panelZIndex, variant = 'icon' }: Props ) {
	if ( ! isAngiePluginActive() ) {
		return null;
	}

	const label = __( 'Fix with Angie', 'elementor' );
	const href = `#angie-prompt=${ encodeURIComponent( prompt ) }`;

	const handleClick = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		event.stopPropagation();
		event.preventDefault();

		sendPromptToAngie( prompt );
		trackFindingClicked( {
			audit,
			locationL2: 'issues',
			actionType: 'fix_with_angie',
			interactionResult: 'angie_prompt_sent',
		} );
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
