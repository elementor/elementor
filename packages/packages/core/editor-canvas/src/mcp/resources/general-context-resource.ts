import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

type ExtendedWindow = Window & {
	angieConfig?: {
		plugins?: Record< string, unknown >;
	};
	elementor?: {
		documents?: {
			getCurrent?: () => {
				config?: {
					settings?: {
						post_title?: string;
					};
				};
			};
		};
	};
};

export const GENERAL_CONTEXT_URI = 'elementor://context/general';

export const initGeneralContextResource = ( reg: MCPRegistryEntry ) => {
	const { resource, sendResourceUpdated } = reg;

	let lastSerializedPayload: string | null = null;

	const getPageTitle = (): string | null => {
		const extendedWindow = window as ExtendedWindow;
		const title = extendedWindow.elementor?.documents?.getCurrent?.()?.config?.settings?.post_title;
		if ( ! title?.trim() ) {
			return null;
		}
		return title;
	};

	const buildPayload = () => {
		const extendedWindow = window as ExtendedWindow;
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const postParam = new URLSearchParams( location.search ).get( 'post' );
		const parsedPostId = postParam ? Number( postParam ) : null;
		const postId = parsedPostId !== null && Number.isFinite( parsedPostId ) ? parsedPostId : null;
		const pageTitle = getPageTitle();
		const urlObject = new URL( window.location.href );
		const pageUrl = urlObject.pathname + urlObject.search;
		const pageName = pageTitle || 'Elementor Editor';
		const plugins = extendedWindow.angieConfig?.plugins;

		return {
			timezone,
			postId,
			currentPage: {
				pageName,
				pageTitle,
				pageUrl,
			},
			...( plugins && { plugins } ),
		};
	};

	const pushUpdateIfChanged = () => {
		const serialized = JSON.stringify( buildPayload() );
		if ( serialized === lastSerializedPayload ) {
			return;
		}
		lastSerializedPayload = serialized;
		sendResourceUpdated( { uri: GENERAL_CONTEXT_URI } );
	};

	resource(
		'general-context',
		GENERAL_CONTEXT_URI,
		{
			description: 'General context: timezone, post id, and current page.',
		},
		async () => {
			return {
				contents: [
					{
						uri: GENERAL_CONTEXT_URI,
						mimeType: 'application/json',
						text: JSON.stringify( buildPayload(), null, 2 ),
					},
				],
			};
		}
	);

	listenTo(
		[
			commandEndEvent( 'editor/documents/switch' ),
			commandEndEvent( 'editor/documents/attach-preview' ),
			commandEndEvent( 'document/elements/settings' ),
		],
		pushUpdateIfChanged
	);

	pushUpdateIfChanged();
};
