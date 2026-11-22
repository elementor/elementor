import { trackDashboardCtaClicked } from './analytics/track-agent-ready-event';

const CTA_SELECTOR = '[data-agent-ready-cta]';

document.addEventListener( 'click', ( event ) => {
	const cta = event.target.closest?.( CTA_SELECTOR );

	if ( cta ) {
		trackDashboardCtaClicked( cta.dataset.agentReadyCta );
	}
} );
