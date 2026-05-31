import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { generatePage } from './api';
import {
	DESIGN_GUIDELINES_DOCS_URI,
	designGuidelinesDocs,
	EXAMPLES_DOCS_URI,
	examplesDocs,
	REFERENCE_DOCS_URI,
	referenceDocs,
	SKILL_DOCS_URI,
	skillDocs,
} from './skill-docs';

const CANVAS_SERVER_NAME = 'editor-canvas';
const INTERACTIONS_SERVER_NAME = 'editor-interactions';

const withServerName = ( serverName: string, uri: string ) => `${ serverName }_${ uri }`;

const AVAILABLE_WIDGETS_URI_V4 = withServerName( CANVAS_SERVER_NAME, 'elementor://context/available-widgets/v4' );
const BREAKPOINTS_SCHEMA_URI = withServerName( CANVAS_SERVER_NAME, 'elementor://breakpoints/list' );
const GENERAL_CONTEXT_URI = withServerName( CANVAS_SERVER_NAME, 'elementor://context/general' );
const INTERACTIONS_SCHEMA_URI = withServerName( INTERACTIONS_SERVER_NAME, 'elementor://interactions/schema' );
const WIDGET_SCHEMA_URI = withServerName( CANVAS_SERVER_NAME, 'elementor://widgets/schema/{widgetType}' );

const schema = {
	pageTitle: z
		.string()
		.optional()
		.describe(
			'Optional page title. Required only when createNewPage is true; otherwise the current page title is kept.'
		),
	dbContent: z
		.string()
		.describe(
			'JSON string of the Elementor V4 content array (the `content` field of the template envelope). This is the raw _elementor_data to persist.'
		),
	classesContent: z
		.string()
		.optional()
		.describe(
			'JSON string of companion global classes/variables ({ global_classes?, global_variables? }). Applied via the native import filter before writing the page.'
		),
	createNewPage: z
		.boolean()
		.optional()
		.describe(
			'Set to true only when the user explicitly asks to create a new page. Defaults to false and updates the current editor page.'
		),
};

const outputSchema = {
	postId: z.number().describe( 'The updated or created WordPress post ID.' ),
	viewUrl: z.string().describe( 'Frontend URL for viewing the updated or created page.' ),
	editUrl: z.string().describe( 'Elementor editor URL for editing the updated or created page.' ),
};

type OutputSchema = z.infer< ReturnType< typeof z.object< typeof outputSchema > > >;

export const initGeneratePageCustomCssTool = ( reg: MCPRegistryEntry ) => {
	registerGeneratePageCustomCssDocsResources( reg );

	reg.addTool( {
		name: 'generate-page-custom-css',
		description:
			'READ the generate-page-custom-css docs and required site resources, then act. Persist a complete Elementor V4 page to the current editor page by default; create a new page only when the user explicitly asks and createNewPage is true. All styling must use raw CSS in custom_css (base64-encoded declarations in styles[].variants[].custom_css.raw) — no typed style PropValues, no global classes, no global variables. Inputs: dbContent is a JSON string of the V4 content array to save as _elementor_data; classesContent is an optional JSON string with companion global_classes/global_variables; pageTitle is required only for new pages and otherwise keeps the current page title.',
		schema,
		outputSchema,
		requiredResources: [
			{
				description: 'editor-generatepage-custom-css: Exact generate Elementor page (custom_css) SKILL.md.',
				uri: SKILL_DOCS_URI,
			},
			{
				description: 'editor-generatepage-custom-css: Exact V4 page generation (custom_css) reference.md.',
				uri: REFERENCE_DOCS_URI,
			},
			{
				description: 'editor-generatepage-custom-css: Exact V4 page generation (custom_css) examples.md.',
				uri: EXAMPLES_DOCS_URI,
			},
			{
				description: 'editor-generatepage-custom-css: Exact V4 page generation (custom_css) design-guidelines.md.',
				uri: DESIGN_GUIDELINES_DOCS_URI,
			},
			{ description: 'editor-canvas: Current page, site context, and active plugins.', uri: GENERAL_CONTEXT_URI },
			{ description: 'editor-canvas: All available V4 widgets for this site.', uri: AVAILABLE_WIDGETS_URI_V4 },
			{
				description: 'editor-canvas: Widget schema by widget type, including settings, nesting, and required children.',
				uri: WIDGET_SCHEMA_URI,
			},
			{ description: 'editor-canvas: Enabled responsive breakpoint IDs.', uri: BREAKPOINTS_SCHEMA_URI },
			{
				description: 'editor-interactions: Available interaction triggers, effects, easings, and Pro-only options.',
				uri: INTERACTIONS_SCHEMA_URI,
			},
		],
		handler: async ( params ): Promise< OutputSchema > => {
			const createNewPage = true === params.createNewPage;
			const pageTitle = sanitizePageTitle( params.pageTitle, createNewPage );
			const targetPostId = createNewPage ? undefined : getCurrentPostId();
			const dbContent = parseContentPayload( params.dbContent );
			const classesContent = parseClassesPayload( params.classesContent );
			const result = await generatePage( {
				dbContent: JSON.stringify( dbContent ),
				classesContent: classesContent ? JSON.stringify( classesContent ) : undefined,
				createNewPage,
				pageTitle,
				targetPostId,
			} );
			window.elementor?.refreshWidgets?.();

			return {
				postId: result.postId,
				viewUrl: result.viewUrl,
				editUrl: result.editUrl,
			};
		},
	} );
};

function registerGeneratePageCustomCssDocsResources( reg: MCPRegistryEntry ) {
	const { resource } = reg;

	resource(
		'generate-page-custom-css-skill-docs',
		SKILL_DOCS_URI,
		{
			title: 'Generate Page (custom_css) Skill Docs',
			description: 'Exact SKILL.md content for generating Elementor V4 pages with raw custom_css styling.',
			mimeType: 'text/markdown',
		},
		async ( uri: URL ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/markdown', text: skillDocs } ],
		} )
	);

	resource(
		'generate-page-custom-css-reference-docs',
		REFERENCE_DOCS_URI,
		{
			title: 'Generate Page (custom_css) Reference Docs',
			description: 'Exact reference.md content for generating Elementor V4 pages with raw custom_css styling.',
			mimeType: 'text/markdown',
		},
		async ( uri: URL ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/markdown', text: referenceDocs } ],
		} )
	);

	resource(
		'generate-page-custom-css-examples-docs',
		EXAMPLES_DOCS_URI,
		{
			title: 'Generate Page (custom_css) Examples Docs',
			description: 'Exact examples.md content for generating Elementor V4 pages with raw custom_css styling.',
			mimeType: 'text/markdown',
		},
		async ( uri: URL ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/markdown', text: examplesDocs } ],
		} )
	);

	resource(
		'generate-page-custom-css-design-guidelines-docs',
		DESIGN_GUIDELINES_DOCS_URI,
		{
			title: 'Generate Page (custom_css) Design Guidelines Docs',
			description: 'Exact design-guidelines.md content for generating Elementor V4 pages with raw custom_css styling.',
			mimeType: 'text/markdown',
		},
		async ( uri: URL ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/markdown', text: designGuidelinesDocs } ],
		} )
	);
}

function sanitizePageTitle( pageTitle: string | undefined, isRequired: boolean ): string | undefined {
	const normalizedTitle = pageTitle?.trim();

	if ( isRequired && ! normalizedTitle ) {
		throw new Error( 'pageTitle must be a non-empty string.' );
	}

	return normalizedTitle || undefined;
}

function getCurrentPostId(): number {
	const postParam = new URLSearchParams( location.search ).get( 'post' );
	const postId = postParam ? Number( postParam ) : NaN;

	if ( ! Number.isInteger( postId ) || postId <= 0 ) {
		throw new Error( 'Cannot determine the current editor page ID. Set createNewPage to true only if the user asked for a new page.' );
	}

	return postId;
}

function parseContentPayload( dbContent: string ): unknown[] {
	const parsed = parseJsonString( dbContent, 'dbContent' );

	if ( ! Array.isArray( parsed ) || parsed.length === 0 ) {
		throw new Error( 'dbContent must be a non-empty JSON array.' );
	}

	return parsed;
}

function parseClassesPayload(
	classesContent?: string
): { global_classes?: unknown; global_variables?: unknown } | undefined {
	if ( ! classesContent || ! classesContent.trim() ) {
		return undefined;
	}

	const parsed = parseJsonString( classesContent, 'classesContent' );

	if ( ! parsed || Array.isArray( parsed ) || typeof parsed !== 'object' ) {
		throw new Error( 'classesContent must be a JSON object when provided.' );
	}

	const classesPayload = parsed as { global_classes?: unknown; global_variables?: unknown };
	const hasSupportedKeys =
		undefined !== classesPayload.global_classes || undefined !== classesPayload.global_variables;

	if ( ! hasSupportedKeys ) {
		throw new Error( 'classesContent must include global_classes and/or global_variables.' );
	}

	return classesPayload;
}

function parseJsonString( json: string, fieldName: string ): unknown {
	try {
		return JSON.parse( json );
	} catch {
		throw new Error( `${ fieldName } must be a valid JSON string.` );
	}
}
