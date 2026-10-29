import { type AuditMeta, type PageAuditReport } from '../../types';
import {
	trackFindingClicked,
	trackFixWithApp,
	trackPanelClosed,
	trackPanelViewed,
	trackRunCompleted,
	trackRunFailed,
	trackRunStarted,
} from '../tracking';

const mockDispatchEvent = jest.fn();

jest.mock( '@elementor/events', () => ( {
	getMixpanel: () => ( { dispatchEvent: mockDispatchEvent } ),
} ) );

const BASE_PROPERTIES = {
	window_name: 'page_audit',
	target_location: 'panel',
	location_l1: 'audit_panel',
};

const AUDIT: AuditMeta = {
	id: 'audits/images-alt-text',
	title: 'Images alt text',
	description: '',
	fixHint: '',
	categories: [ 'seo' ],
	severity: 'info',
	weight: 10,
};

const EMPTY_REPORT: PageAuditReport = {
	documentId: 1,
	runAt: 1700000000000,
	overall: 100,
	categories: {
		'best-practices': { score: 100, failed: 0, total: 0 },
		seo: { score: 100, failed: 0, total: 0 },
		accessibility: { score: 100, failed: 0, total: 0 },
		performance: { score: 100, failed: 0, total: 0 },
		compliance: { score: 100, failed: 0, total: 0 },
	},
	auditResults: [],
};

describe( 'audit tracking', () => {
	beforeEach( () => {
		mockDispatchEvent.mockReset();
	} );

	it( 'dispatches page_audit_panel_viewed with prior report and first open metadata', () => {
		// Act.
		trackPanelViewed( { hasPriorReport: true, isFirstOpen: false } );

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'page_audit_panel_viewed', {
			...BASE_PROPERTIES,
			interaction_type: 'view',
			target_type: 'panel',
			target_name: 'page_audit_panel',
			interaction_result: 'panel_viewed',
			metadata: { has_prior_report: true, is_first_open: false },
		} );
	} );

	it( 'dispatches page_audit_panel_closed', () => {
		// Act.
		trackPanelClosed();

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'page_audit_panel_closed', {
			...BASE_PROPERTIES,
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'close',
			interaction_result: 'panel_closed',
		} );
	} );

	it.each( [ 'run_audit', 'rescan' ] as const )( 'dispatches page_audit_run_started for %s', ( trigger ) => {
		// Act.
		trackRunStarted( trigger );

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'page_audit_run_started', {
			...BASE_PROPERTIES,
			interaction_type: 'click',
			target_type: 'button',
			target_name: trigger,
			interaction_result: 'run_initiated',
		} );
	} );

	it( 'dispatches page_audit_run_completed with the run summary', () => {
		// Act.
		trackRunCompleted( EMPTY_REPORT );

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'page_audit_run_completed', {
			...BASE_PROPERTIES,
			interaction_type: 'view',
			target_type: 'report',
			target_name: 'audit_report',
			interaction_result: 'run_completed',
			state: 'success',
			metadata: {
				score: 100,
				fix_count: 0,
				error_count: 0,
				warning_count: 0,
				suggestion_count: 0,
				required_fixes: [],
			},
		} );
	} );

	it( 'dispatches page_audit_run_completed as run_failed without summary fields', () => {
		// Act.
		trackRunFailed();

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'page_audit_run_completed', {
			...BASE_PROPERTIES,
			interaction_type: 'view',
			target_type: 'report',
			target_name: 'audit_report',
			interaction_result: 'run_failed',
		} );
	} );

	it( 'dispatches page_audit_finding_clicked for view_issue without app status', () => {
		// Act.
		trackFindingClicked( {
			audit: AUDIT,
			locationL2: 'issues',
			actionType: 'view_issue',
			interactionResult: 'element_focused',
		} );

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'page_audit_finding_clicked', {
			...BASE_PROPERTIES,
			interaction_type: 'click',
			target_type: 'row',
			target_name: 'finding_row',
			action_type: 'view_issue',
			target_value: 'images_alt_text',
			interaction_result: 'element_focused',
			state: 'suggestion',
			location_l2: 'issues',
		} );
	} );

	it.each( [
		[ true, 'installed' ],
		[ false, 'not_installed' ],
	] )( 'dispatches fix_with_app with app_status when appInstalled is %s', ( appInstalled, appStatus ) => {
		// Act.
		trackFixWithApp( AUDIT, { auditId: AUDIT.id, label: 'label', appInstalled }, 'overview' );

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith(
			'page_audit_finding_clicked',
			expect.objectContaining( {
				action_type: 'fix_with_app',
				interaction_result: 'app_opened',
				app_status: appStatus,
				location_l2: 'overview',
			} )
		);
	} );

	it( 'does not dispatch fix_with_app when the violation has no resolving app', () => {
		// Act.
		trackFixWithApp( AUDIT, { auditId: AUDIT.id, label: 'label' }, 'issues' );

		// Assert.
		expect( mockDispatchEvent ).not.toHaveBeenCalled();
	} );
} );
