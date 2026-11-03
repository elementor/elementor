import { __ } from '@wordpress/i18n';

export const SCANNER_STATE_FIRST_RUN = 'first_run';
export const SCANNER_STATE_PROGRESS = 'progress';
export const SCANNER_STATE_FIRST_CHECK = 'first_check';
export const SCANNER_STATE_ACTIVATING = 'activating';
export const SCANNER_STATE_FIXES = 'fixes';
export const SCANNER_STATE_ERROR_PROGRESS = 'error_progress';
export const SCANNER_STATE_ERROR_REPORT = 'error_report';
export const SCANNER_STATE_RESCANNING = 'rescanning';

export const FIX_WITH_TOGGLE = 'toggle';
export const FIX_WITH_ANGIE = 'angie';
export const FIX_WITH_PREFERENCE = 'preference';
export const FIX_WITH_LINK = 'link';
export const FIX_WITH_SEO = 'seo';
export const FIX_WITH_MANUAL = 'manual';

export const FIX_BY_SEO_PLUGIN = 'seo plugin';
export const FIX_BY_ANGIE = 'angie';
export const FIX_BY_ANGIE_MCP = 'angie / mcp';
export const FIX_BY_ALLY = 'ally';
export const FIX_BY_MANUAL = 'manual';
export const FIX_BY_BUILT_IN = 'built in';

export const FIX_DETAILS_NOT_APPLICABLE = 'n/a';

export const PRIORITY_REQUIRED = 'required';
export const PRIORITY_RECOMMENDED = 'recommended';

export const TIER_REQUIRED = 'required';
export const TIER_RECOMMENDED = 'recommended';
export const TIER_EMERGING = 'emerging';

const PRIORITY_BY_TIER = {
	[ TIER_REQUIRED ]: PRIORITY_REQUIRED,
	[ TIER_RECOMMENDED ]: PRIORITY_RECOMMENDED,
};

const normalizeTier = ( tier ) => ( 'string' === typeof tier ? tier.toLowerCase() : '' );

export const getPriorityFromTier = ( tier ) => PRIORITY_BY_TIER[ normalizeTier( tier ) ] ?? null;

export const isEmergingTier = ( tier ) => TIER_EMERGING === normalizeTier( tier );

export const getCheckPriorityLabel = ( { tier, priority } ) => {
	if ( PRIORITY_REQUIRED === priority ) {
		return __( 'Required', 'elementor' );
	}

	if ( PRIORITY_RECOMMENDED === priority ) {
		return __( 'Recommended', 'elementor' );
	}

	return isEmergingTier( tier ) ? __( 'Emerging', 'elementor' ) : '';
};

export const CHECK_STATUS_PASS = 'pass';
export const CHECK_STATUS_FAIL = 'fail';
export const CHECK_STATUS_PARTIAL = 'partial';

export const FAILING_CHECK_STATUSES = [ CHECK_STATUS_FAIL, CHECK_STATUS_PARTIAL ];

const normalizeCheckStatus = ( status ) => ( 'string' === typeof status ? status.toLowerCase() : '' );

export const getCheckStatusDotColor = ( status ) => {
	const normalized = normalizeCheckStatus( status );

	if ( CHECK_STATUS_PARTIAL === normalized ) {
		return 'warning.light';
	}

	if ( CHECK_STATUS_PASS === normalized ) {
		return 'success.light';
	}

	return 'error.light';
};

export const getCheckStatusLabel = ( status ) => {
	const normalized = normalizeCheckStatus( status );

	if ( CHECK_STATUS_PARTIAL === normalized ) {
		return __( 'Partial', 'elementor' );
	}

	if ( CHECK_STATUS_PASS === normalized ) {
		return __( 'Pass', 'elementor' );
	}

	if ( CHECK_STATUS_FAIL === normalized ) {
		return __( 'Fail', 'elementor' );
	}

	return '';
};

export const OUTSIDE_SCAN_STATUS_OK = 'ok';
export const OUTSIDE_SCAN_STATUS_FAILED = 'failed';

export const SCAN_FAILURE_REASON_BLOCKED = 'blocked';
export const SCAN_FAILURE_REASON_LOCAL = 'local';

export const HTTP_TOO_MANY_REQUESTS = 429;

export const SCANNER_DEFAULT_COOLDOWN_SECONDS = 300;

export const STAGE_REACH = 'reach';
export const STAGE_IDENTIFY = 'identify';
export const STAGE_ACT = 'act';
export const STAGE_COMMERCE = 'commerce';

export const PROGRESS_STEP_DONE = 'done';
export const PROGRESS_STEP_ACTIVE = 'active';
export const PROGRESS_STEP_PENDING = 'pending';
export const PROGRESS_STEP_FAILED = 'failed';

export const getStageLabels = () => ( {
	[ STAGE_REACH ]: __( 'Find', 'elementor' ),
	[ STAGE_IDENTIFY ]: __( 'Read', 'elementor' ),
	[ STAGE_ACT ]: __( 'Act', 'elementor' ),
	[ STAGE_COMMERCE ]: __( 'Commerce', 'elementor' ),
} );

export const getStageQuestions = () => ( {
	[ STAGE_REACH ]: __( 'Can agents get to your site?', 'elementor' ),
	[ STAGE_IDENTIFY ]: __( 'Can agents understand what your business offers?', 'elementor' ),
	[ STAGE_ACT ]: __( 'Can agents take action, like filling in a form?', 'elementor' ),
	[ STAGE_COMMERCE ]: '',
} );

export const SCANNER_COLORS = {
	paper: '#fff',
	tableHeader: '#f3f4f7',
	ringTrack: '#edeef2',
	banner: '#fbf4eb',
	bannerBorder: '#d97706',
	activate: '#bb5b1d',
	activateHover: '#a14e19',
	accent: '#c00bb9',
	accentHover: '#a10a9b',
	rowHover: '#f9fafa',
	switchOffTrack: '#d5dadf',
	infoChipBackground: '#ebf2fe',
	infoChipText: '#1945a4',
	secondaryChipBackground: '#f0f0f2',
	secondaryChipText: '#383e44',
	countBadge: '#fbf2fb',
	stepBadge: '#f3f4f7',
	promptBackground: '#f9fafa',
};

export const DOT_FIELD = {
	size: 1.8,
	grid: 7,
	// Admin-only background shown for a one-time scan run, so a 15000-dot ceiling is acceptable.
	maxDots: 15000,
	rgb: '89, 89, 89',
	opacityMin: 0.02,
	opacityStep: 0.02,
	opacitySteps: 11,
	opacityBias: 2,
	opacityFloor: 0.4,
	maxDevicePixelRatio: 2,
	hashColumn: 127.1,
	hashRow: 311.7,
	hashScale: 43758.5453,
	driftScaleX: 0.02,
	driftScaleY: 0.011,
	secondaryDrift: 0.7,
};

export const SCORE_TIER_LOW = 'low';
export const SCORE_TIER_MID = 'mid';
export const SCORE_TIER_HIGH = 'high';
export const SCORE_TIER_LOW_MAX = 30;
export const SCORE_TIER_HIGH_MIN = 80;

const SCORE_RING_GRADIENT_VECTOR = { x1: -28, y1: -35.5, x2: 95.5, y2: 56 };

export const SCORE_RING_GRADIENTS = {
	[ SCORE_TIER_LOW ]: { from: '#93003F', to: '#EF4444', ...SCORE_RING_GRADIENT_VECTOR },
	[ SCORE_TIER_MID ]: { from: '#D97706', to: '#FFCB00', ...SCORE_RING_GRADIENT_VECTOR },
	[ SCORE_TIER_HIGH ]: { from: '#0A875A', to: '#10B981', ...SCORE_RING_GRADIENT_VECTOR },
};

export const getStageHealthLabels = () => ( {
	[ SCORE_TIER_LOW ]: __( 'Needs work', 'elementor' ),
	[ SCORE_TIER_MID ]: __( 'Getting there', 'elementor' ),
	[ SCORE_TIER_HIGH ]: __( 'Strong', 'elementor' ),
} );

export const STAGE_HEALTH_COLORS = {
	[ SCORE_TIER_LOW ]: { fill: 'error.light', text: 'error.main' },
	[ SCORE_TIER_MID ]: { fill: 'warning.light', text: 'warning.main' },
	[ SCORE_TIER_HIGH ]: { fill: 'success.light', text: 'success.main' },
};

export const STAGE_COMING_SOON_FILL = 'action.disabled';

export const SCANNER_LAYOUT = {
	pageGap: 32,
	summaryBlockBottomSpace: 48,
	progressCardWidth: 450,
	progressBarWidth: 198,
	progressBarHeight: 4,
	progressBarRadius: '50px',
	progressTrackWash: 0.6,
	wrapInlinePadding: 32,
	wrapBlockStart: 24,
	progressPaneMinHeight: 'calc(100vh - var(--e-admin-bar-height, 0px) - var(--e-top-bar-header-height, 0px))',
	checkingFontSize: 13,
	checkingLineHeight: '18px',
	checkingLetterSpacing: '0.16px',
	actionAreaWidth: 180,
	actionColumnWidth: 200,
	statusIconSlot: 20,
	completedIconSize: 24,
	completedActionHeight: 28,
	chevronSize: 24,
	countBadgeSize: 24,
	drawerRadius: '12px',
	preferenceRows: 4,
	prioritySelectWidth: 120,
	skeletonBlockHeight: 16,
	skeletonHeadingWidth: 120,
	skeletonHeadingHeight: 32,
	skeletonMetaWidth: 406,
	skeletonSectionHeadingWidth: 138,
	skeletonStageHeight: 130,
	skeletonRowHeight: 80,
	skeletonRowCount: 4,
	tableColumnWidth: 150,
	passingStageWidth: 100,
	fixRowMinHeight: 61,
	passingRowHeight: 46,
	tableHeaderHeight: 32,
	statusDotSize: 8,
	ringSize: 100,
	ringStroke: 10,
	cardRadius: '12px',
	featureCardRadius: '16px',
};

export const SCANNER_MOTION = {
	ringArriveMs: 950,
	ringActivatingMs: 2000,
	ringLandMs: 800,
	drawerMs: 220,
	chevronMs: 220,
	completedCheckMs: 320,
	rowAppearMs: 260,
	progressBarMs: 450,
	dotShimmerMs: 12000,
	errorProgressPauseMs: 1500,
	rescanMinMs: 800,
	easeOutExpo: 'cubic-bezier(.22, 1, .36, 1)',
	easeOutCubic: 'cubic-bezier(.33, 1, .68, 1)',
	overshoot: 'cubic-bezier(.34, 1.56, .64, 1)',
};

export const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';

export const REDUCED_MOTION_QUERY = `@media ${ REDUCED_MOTION_MEDIA }`;

export const REDUCED_MOTION_SX = {
	[ REDUCED_MOTION_QUERY ]: {
		transition: 'none',
		animation: 'none',
	},
};

export const VISUALLY_HIDDEN_SX = {
	position: 'absolute',
	width: '1px',
	height: '1px',
	overflow: 'hidden',
	clip: 'rect(0 0 0 0)',
	whiteSpace: 'nowrap',
};

export const SCAN_SOURCE_URL = 'https://ora.ai/docs';

export const sectionHeadingSx = {
	fontSize: '15px',
	fontWeight: 600,
	lineHeight: 'normal',
	letterSpacing: '1px',
	textTransform: 'uppercase',
};
