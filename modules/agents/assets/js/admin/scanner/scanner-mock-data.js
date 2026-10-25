import { __ } from '@wordpress/i18n';

import {
	FIX_WITH_ANGIE,
	FIX_WITH_LINK,
	FIX_WITH_PREFERENCE,
	FIX_WITH_TOGGLE,
	OUTSIDE_SCAN_STATUS_OK,
	PRIORITY_RECOMMENDED,
	PRIORITY_REQUIRED,
	STAGE_ACT,
	STAGE_COMMERCE,
	STAGE_IDENTIFY,
	STAGE_REACH,
	TIER_RECOMMENDED,
	TIER_REQUIRED,
} from './scanner-constants';

// TODO: Replace with the step list returned (or streamed) by the WP Admin scanner endpoint. If a real scan takes ~30s the progress screen needs a different shape (handoff §10.5).
export const getProgressSteps = () => [
	{ id: 'reading-site', label: __( 'Reading your site the way an AI assistant would', 'elementor' ) },
	{ id: 'business-name', label: __( 'Business name & what you do', 'elementor' ) },
	{ id: 'location', label: __( 'Where you\'re located', 'elementor' ) },
	{ id: 'service-area', label: __( 'Areas you serve', 'elementor' ) },
	{ id: 'price-range', label: __( 'Price range', 'elementor' ) },
	{ id: 'contact', label: __( 'How to reach you', 'elementor' ) },
	{ id: 'response-time', label: __( 'How fast you respond', 'elementor' ) },
];

export const ERROR_HIDDEN_STEP_ID = 'business-name';

const getFailingChecks = () => [
	{
		id: 'agent-path',
		title: __( 'Agents can\'t find a path into your site', 'elementor' ),
		points: 7,
		tier: TIER_REQUIRED,
		priority: PRIORITY_REQUIRED,
		stage: STAGE_REACH,
		evidence: __( 'No agent discovery files were found under /.well-known/', 'elementor' ),
		explanation: {
			whatItMeans: __( 'Agents look for a small set of files that tell them what your site offers and where to start. Without them, an agent has to guess.', 'elementor' ),
			howToFix: __( 'Turn on agent discovery so Elementor publishes the files for you, or add them to /.well-known/ by hand.', 'elementor' ),
		},
		fixWith: FIX_WITH_TOGGLE,
		isLocal: true,
		resolvedByActivation: false,
	},
	{
		id: 'service-area',
		title: __( 'Your service area isn\'t stated anywhere an agent can read', 'elementor' ),
		points: 7,
		tier: TIER_REQUIRED,
		priority: PRIORITY_REQUIRED,
		stage: STAGE_IDENTIFY,
		evidence: __( 'No areaServed value in your structured data', 'elementor' ),
		explanation: {
			whatItMeans: __( 'Tell agents where you work so they only recommend you to people you can serve.', 'elementor' ),
			howToFix: __( 'List the cities, regions or countries you serve.', 'elementor' ),
		},
		preferencePlaceholder: __( 'e.g. Greater London and the South East', 'elementor' ),
		fixWith: FIX_WITH_PREFERENCE,
		isLocal: true,
		resolvedByActivation: false,
	},
	{
		id: 'opening-hours',
		title: __( 'Agents can\'t tell when you\'re open', 'elementor' ),
		points: 7,
		tier: TIER_REQUIRED,
		priority: PRIORITY_REQUIRED,
		stage: STAGE_IDENTIFY,
		evidence: __( 'No openingHours found on your homepage', 'elementor' ),
		explanation: {
			whatItMeans: __( 'When someone asks an agent whether you\'re open, it needs a machine-readable answer.', 'elementor' ),
			howToFix: __( 'Add your opening hours to your site\'s structured data.', 'elementor' ),
		},
		fixWith: FIX_WITH_ANGIE,
		isLocal: false,
		resolvedByActivation: false,
	},
	{
		id: 'contact-action',
		title: __( 'Agents can\'t find a way to contact you', 'elementor' ),
		points: 6,
		tier: TIER_RECOMMENDED,
		priority: PRIORITY_RECOMMENDED,
		stage: STAGE_ACT,
		evidence: __( 'No ContactPoint or contact form found', 'elementor' ),
		explanation: {
			whatItMeans: __( 'Agents can book or ask on a visitor\'s behalf only if they can find how to reach you.', 'elementor' ),
			howToFix: __( 'Add a contact point with a phone number or email to your structured data.', 'elementor' ),
		},
		fixWith: FIX_WITH_ANGIE,
		isLocal: false,
		resolvedByActivation: false,
	},
	{
		id: 'llms-guide',
		title: __( 'Agents don\'t get a guide to your content', 'elementor' ),
		points: 6,
		tier: TIER_RECOMMENDED,
		priority: PRIORITY_RECOMMENDED,
		stage: STAGE_REACH,
		evidence: __( 'llms.txt is missing a summary of your key pages', 'elementor' ),
		explanation: {
			whatItMeans: __( 'llms.txt gives agents a short map of your most useful pages.', 'elementor' ),
			howToFix: __( 'Choose which content goes into llms.txt in Agent Access.', 'elementor' ),
		},
		fixWith: FIX_WITH_LINK,
		fixUrl: null,
		isLocal: true,
		resolvedByActivation: false,
	},
	{
		id: 'markdown-pages',
		title: __( 'Agents can\'t read clean versions of your pages', 'elementor' ),
		points: 15,
		tier: TIER_REQUIRED,
		priority: PRIORITY_REQUIRED,
		stage: STAGE_REACH,
		evidence: __( 'Requests for .md versions of your pages return 404', 'elementor' ),
		explanation: {
			whatItMeans: __( 'Agents read faster and more accurately from markdown than from full HTML pages.', 'elementor' ),
			howToFix: __( 'Activate Agent Ready to serve a markdown version of every page.', 'elementor' ),
		},
		fixWith: FIX_WITH_TOGGLE,
		isLocal: true,
		resolvedByActivation: true,
	},
	{
		id: 'bot-rules',
		title: __( 'AI agents are blocked by your robots.txt', 'elementor' ),
		points: 15,
		tier: TIER_REQUIRED,
		priority: PRIORITY_REQUIRED,
		stage: STAGE_REACH,
		evidence: __( 'robots.txt has no rules for AI user agents', 'elementor' ),
		explanation: {
			whatItMeans: __( 'Without explicit rules, many AI agents treat your site as off limits.', 'elementor' ),
			howToFix: __( 'Activate Agent Ready to add per-bot rules: search allowed, AI answers allowed, no AI training.', 'elementor' ),
		},
		fixWith: FIX_WITH_TOGGLE,
		isLocal: true,
		resolvedByActivation: true,
	},
];

const getPassingChecks = () => [
	{ id: 'https', stage: STAGE_REACH, title: __( 'Your site loads over HTTPS', 'elementor' ), description: __( 'Agents only trust and connect to sites served over a secure connection.', 'elementor' ), points: 7 },
	{ id: 'sitemap', stage: STAGE_REACH, title: __( 'Agents can read your sitemap', 'elementor' ), description: __( 'A sitemap lists your pages so agents can find them without guessing.', 'elementor' ), points: 7 },
	{ id: 'site-name', stage: STAGE_IDENTIFY, title: __( 'Your business name is clear', 'elementor' ), description: __( 'A clear site name lets agents say who you are when they recommend you.', 'elementor' ), points: 8 },
	{ id: 'page-titles', stage: STAGE_IDENTIFY, title: __( 'Every page has a descriptive title', 'elementor' ), description: __( 'Descriptive titles help agents tell your pages apart.', 'elementor' ), points: 8 },
];

const getStages = () => [
	{ id: STAGE_REACH, earned: 2, total: 6 },
	{ id: STAGE_IDENTIFY, earned: 2, total: 4 },
	{ id: STAGE_ACT, earned: 0, total: 1 },
	{ id: STAGE_COMMERCE, earned: 0, total: 0, isComingSoon: true },
];

// TODO: Replace fixPrompt with the prompt returned by the scanner endpoint.
const withFixPrompt = ( check ) => ( {
	...check,
	fixPrompt: check.explanation.howToFix,
} );

export const getMockScanResult = () => ( {
	score: 30,
	ranAt: new Date().toISOString(),
	stages: getStages(),
	checks: getFailingChecks().map( withFixPrompt ),
	passingChecks: getPassingChecks(),
	outsideScan: { status: OUTSIDE_SCAN_STATUS_OK, reason: null },
	// TODO: The switch -> check mapping (which checks Activate resolves, and whether fully) is still open with engineering (handoff §10.1). Drop scoreAfter once `score` itself reflects activation after a rescan.
	activation: { scoreAfter: 60 },
} );
