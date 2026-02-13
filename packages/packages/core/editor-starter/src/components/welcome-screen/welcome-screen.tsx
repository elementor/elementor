import * as React from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography } from '@elementor/ui';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { httpService } from '@elementor/http-client';
import { __ } from '@wordpress/i18n';

import { env } from '../../env';
import {
	AiPlannerIllustration,
	BlankCanvasIllustration,
	TemplatesIllustration,
} from './card-illustrations';
import { WelcomeCard } from './welcome-card';

const AI_PLANNER_URL = 'https://planner.elementor.com/home.html';

const CANVAS_WRAPPER_ID = 'elementor-preview-responsive-wrapper';

function dismissStarter(): void {
	httpService().post( 'elementor/v1/e-onboarding/user-progress', {
		starter_dismissed: true,
	} ).catch( () => {
		// Silently fail — the dismiss is a best-effort operation.
	} );
}

export function WelcomeScreen() {
	const [ isDismissed, setIsDismissed ] = React.useState( false );
	const [ portalRoot, setPortalRoot ] = React.useState< HTMLElement | null >( null );

	const shouldShow = env?.welcome_screen?.show && ! isDismissed;

	React.useEffect( () => {
		const el = document.getElementById( CANVAS_WRAPPER_ID );

		if ( el ) {
			setPortalRoot( el );
		}
	}, [] );

	const handleDismiss = React.useCallback( () => {
		setIsDismissed( true );
		dismissStarter();
	}, [] );

	const handleAiPlanner = React.useCallback( () => {
		handleDismiss();
		window.open( AI_PLANNER_URL, '_blank', 'noopener,noreferrer' );
	}, [ handleDismiss ] );

	const handleTemplates = React.useCallback( () => {
		handleDismiss();

		try {
			runCommand( 'library/open' );
		} catch {
			// Silently fail if library command is not available.
		}
	}, [ handleDismiss ] );

	const handleBlankCanvas = React.useCallback( () => {
		handleDismiss();
	}, [ handleDismiss ] );

	if ( ! shouldShow || ! portalRoot ) {
		return null;
	}

	return createPortal(
		<Box
			data-testid="welcome-screen"
			sx={ {
				position: 'absolute',
				inset: 0,
				zIndex: 1000,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'background.default',
			} }
		>
			<Box
				sx={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '24px',
				} }
			>
				<Typography
					variant="h5"
					sx={ {
						fontWeight: 700,
						color: 'text.primary',
					} }
				>
					{ __( 'How would you like to start?', 'elementor' ) }
				</Typography>
				<Box
					sx={ {
						display: 'flex',
						gap: '24px',
					} }
				>
					<WelcomeCard
						label={ __( 'AI Site Planner', 'elementor' ) }
						onClick={ handleAiPlanner }
					>
						<AiPlannerIllustration />
					</WelcomeCard>
					<WelcomeCard
						label={ __( 'Website templates', 'elementor' ) }
						onClick={ handleTemplates }
					>
						<TemplatesIllustration />
					</WelcomeCard>
					<WelcomeCard
						label={ __( 'Blank canvas', 'elementor' ) }
						onClick={ handleBlankCanvas }
					>
						<BlankCanvasIllustration />
					</WelcomeCard>
				</Box>
			</Box>
		</Box>,
		portalRoot,
	);
}
