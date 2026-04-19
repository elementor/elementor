import { type MCPRegistryEntry } from '@elementor/editor-mcp';

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

const TIME_UPDATE_INTERVAL_MS = 60_000;

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

		const date = new Date();
		const today = {
			gmt: date.toLocaleString( undefined, { timeZone: 'UTC' } ),
			user: date.toLocaleString( undefined, {
				timeZone: timezone,
				timeZoneName: 'long',
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			} ),
		};

		return {
			today,
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
			description: 'General context: current date and time, timezone, post id, and current page.',
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

	pushUpdateIfChanged();
	setInterval( pushUpdateIfChanged, TIME_UPDATE_INTERVAL_MS );
};
