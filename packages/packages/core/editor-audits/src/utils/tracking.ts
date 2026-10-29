import { getMixpanel } from '@elementor/events';

import {
	FINDING_CLICKED_EVENT,
	PANEL_CLOSED_EVENT,
	PANEL_VIEWED_EVENT,
	RUN_COMPLETED_EVENT,
	RUN_STARTED_EVENT,
	TRACKING_LOCATION_L1,
	TRACKING_TARGET_LOCATION,
	TRACKING_WINDOW_NAME,
} from '../constants';
import { type AuditMeta, type AuditViolation, type PageAuditReport } from '../types';
import { buildRunSummary } from './build-run-summary';
import { toCheckName, toTrackingSeverity } from './tracking-names';

export type RunTrigger = 'run_audit' | 'rescan';

export type ViewIssueResult =
	| 'element_focused'
	| 'page_settings_opened'
	| 'site_settings_opened'
	| 'external_url_opened';

export type FindingLocation = 'overview' | 'issues';

type FindingAction =
	| { actionType: 'view_issue'; interactionResult: ViewIssueResult }
	| { actionType: 'fix_with_angie'; interactionResult: 'angie_prompt_sent' }
	| { actionType: 'fix_with_app'; interactionResult: 'app_opened'; appInstalled?: boolean };

type FindingClick = FindingAction & {
	audit: AuditMeta;
	locationL2: FindingLocation;
};

const dispatch = ( eventName: string, payload: Record< string, unknown > ) => {
	getMixpanel().dispatchEvent?.( eventName, {
		window_name: TRACKING_WINDOW_NAME,
		target_location: TRACKING_TARGET_LOCATION,
		location_l1: TRACKING_LOCATION_L1,
		...payload,
	} );
};

export const trackPanelViewed = ( {
	hasPriorReport,
	isFirstOpen,
}: {
	hasPriorReport: boolean;
	isFirstOpen: boolean;
} ) => {
	dispatch( PANEL_VIEWED_EVENT, {
		interaction_type: 'view',
		target_type: 'panel',
		target_name: 'page_audit_panel',
		interaction_result: 'panel_viewed',
		metadata: { has_prior_report: hasPriorReport, is_first_open: isFirstOpen },
	} );
};

export const trackPanelClosed = () => {
	dispatch( PANEL_CLOSED_EVENT, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'close',
		interaction_result: 'panel_closed',
	} );
};

export const trackRunStarted = ( trigger: RunTrigger ) => {
	dispatch( RUN_STARTED_EVENT, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: trigger,
		interaction_result: 'run_initiated',
	} );
};

const trackRunOutcome = ( interactionResult: 'run_completed' | 'run_failed', details: Record< string, unknown > ) => {
	dispatch( RUN_COMPLETED_EVENT, {
		interaction_type: 'view',
		target_type: 'report',
		target_name: 'audit_report',
		interaction_result: interactionResult,
		...details,
	} );
};

export const trackRunCompleted = ( report: PageAuditReport ) => {
	const { state, metadata } = buildRunSummary( report );

	trackRunOutcome( 'run_completed', { state, metadata } );
};

export const trackRunFailed = () => {
	trackRunOutcome( 'run_failed', {} );
};

export const trackFixWithApp = ( audit: AuditMeta, violation: AuditViolation, locationL2: FindingLocation ) => {
	if ( violation.appInstalled === undefined ) {
		return;
	}

	trackFindingClicked( {
		audit,
		locationL2,
		actionType: 'fix_with_app',
		interactionResult: 'app_opened',
		appInstalled: violation.appInstalled,
	} );
};

export const trackFindingClicked = ( click: FindingClick ) => {
	const { audit, locationL2, actionType, interactionResult } = click;

	dispatch( FINDING_CLICKED_EVENT, {
		interaction_type: 'click',
		target_type: 'row',
		target_name: 'finding_row',
		action_type: actionType,
		target_value: toCheckName( audit.id ),
		interaction_result: interactionResult,
		state: toTrackingSeverity( audit.severity ),
		location_l2: locationL2,
		...( click.actionType === 'fix_with_app' && {
			app_status: click.appInstalled ? 'installed' : 'not_installed',
		} ),
	} );
};
