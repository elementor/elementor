import {
	type AngieMcpSdk,
	createAngieMcpSdkInstance,
	LAYOUT_FLOATING_CHAT,
	type LoadSidebarV2Options,
} from '@elementor/editor-mcp';
import { __ } from '@wordpress/i18n';

import {
	ANGIE_WIDGET_HIDDEN_CLASS,
	INLINE_TEXT_GENERATOR_APP_ID,
	INLINE_TEXT_GENERATOR_CONTAINER_ID,
	INLINE_TEXT_GENERATOR_INSTANCE_ID,
	INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
} from './constants';
import { createInlineTextGeneratorMcpServer } from './create-inline-text-generator-mcp-server';

const INLINE_TEXT_GENERATION_PROMPT = __(
	'Improve or generate text for the active inline-editing field. First call get_active_inline_text to read the current HTML, then use apply_generated_inline_text with your result. Preserve meaningful inline formatting where appropriate.',
	'elementor'
);

const CONTAINER_GAP_PX = 8;
const CONTAINER_FALLBACK_WIDTH_PX = 400;
const CONTAINER_FALLBACK_HEIGHT_PX = 600;

let sdk: AngieMcpSdk | null = null;
let bootPromise: Promise< AngieMcpSdk > | null = null;

export const getInlineTextGeneratorLoadSidebarOptions = (): LoadSidebarV2Options => ( {
	host: {
		appId: INLINE_TEXT_GENERATOR_APP_ID,
		instanceId: INLINE_TEXT_GENERATOR_INSTANCE_ID,
	},
	container: {
		id: INLINE_TEXT_GENERATOR_CONTAINER_ID,
		layout: LAYOUT_FLOATING_CHAT,
		chatToggleButton: {
			enabled: false,
			selector: '',
		},
	},
	widgetConfig: {
		title: __( 'Inline text generator', 'elementor' ),
		featuredMcpServer: INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
		localServers: { skipLoading: true },
		modeSwitcher: { enabled: false, default: 'agent' },
	},
} );

const getContainerSize = ( container: HTMLElement ) => {
	const rect = container.getBoundingClientRect();

	return {
		width: rect.width || CONTAINER_FALLBACK_WIDTH_PX,
		height: rect.height || CONTAINER_FALLBACK_HEIGHT_PX,
	};
};

const isRtl = () => document.documentElement.dir === 'rtl';

const computePlacement = ( anchor: HTMLElement, container: HTMLElement ) => {
	const anchorRect = anchor.getBoundingClientRect();
	const { width: containerWidth, height: containerHeight } = getContainerSize( container );
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	const spaceAbove = anchorRect.top;
	const spaceBelow = viewportHeight - anchorRect.bottom;
	const openUpwards = spaceAbove >= containerHeight + CONTAINER_GAP_PX || spaceAbove >= spaceBelow;

	const rtl = isRtl();
	const spaceOnInlineEnd = rtl ? anchorRect.left : viewportWidth - anchorRect.right;
	const spaceOnInlineStart = rtl ? viewportWidth - anchorRect.right : anchorRect.left;
	const alignToInlineEnd = spaceOnInlineEnd >= containerWidth || spaceOnInlineEnd >= spaceOnInlineStart;

	return { openUpwards, alignToInlineEnd, anchorRect, viewportWidth, viewportHeight };
};

const clampToViewport = ( value: number, viewportSize: number, containerSize: number ) =>
	Math.max( CONTAINER_GAP_PX, Math.min( value, viewportSize - containerSize - CONTAINER_GAP_PX ) );

export const positionInlineTextGeneratorContainer = ( anchor: HTMLElement ) => {
	const container = document.getElementById( INLINE_TEXT_GENERATOR_CONTAINER_ID );

	if ( ! container ) {
		return;
	}

	const { openUpwards, alignToInlineEnd, anchorRect, viewportWidth, viewportHeight } = computePlacement(
		anchor,
		container
	);
	const { width: containerWidth, height: containerHeight } = getContainerSize( container );

	container.style.setProperty( 'position', 'fixed', 'important' );

	if ( openUpwards ) {
		const bottom = clampToViewport(
			viewportHeight - anchorRect.top + CONTAINER_GAP_PX,
			viewportHeight,
			containerHeight
		);
		container.style.setProperty( 'top', 'auto', 'important' );
		container.style.setProperty( 'bottom', `${ bottom }px`, 'important' );
	} else {
		const top = clampToViewport( anchorRect.bottom + CONTAINER_GAP_PX, viewportHeight, containerHeight );
		container.style.setProperty( 'bottom', 'auto', 'important' );
		container.style.setProperty( 'top', `${ top }px`, 'important' );
	}

	const rtl = isRtl();

	if ( alignToInlineEnd ) {
		const insetInlineEnd = clampToViewport(
			rtl ? anchorRect.left : viewportWidth - anchorRect.right,
			viewportWidth,
			containerWidth
		);
		container.style.setProperty( 'inset-inline-start', 'auto', 'important' );
		container.style.setProperty( 'inset-inline-end', `${ insetInlineEnd }px`, 'important' );
	} else {
		const insetInlineStart = clampToViewport(
			rtl ? viewportWidth - anchorRect.right : anchorRect.left,
			viewportWidth,
			containerWidth
		);
		container.style.setProperty( 'inset-inline-end', 'auto', 'important' );
		container.style.setProperty( 'inset-inline-start', `${ insetInlineStart }px`, 'important' );
	}
};

export const openInlineTextGeneratorContainer = () => {
	const container = document.getElementById( INLINE_TEXT_GENERATOR_CONTAINER_ID );

	if ( container ) {
		container.classList.remove( ANGIE_WIDGET_HIDDEN_CLASS );
	}
};

export const resetInlineTextGeneratorBootStateForTests = () => {
	sdk = null;
	bootPromise = null;
};

export const bootInlineTextGeneratorSdk = async (): Promise< AngieMcpSdk > => {
	if ( sdk ) {
		return sdk;
	}

	if ( bootPromise ) {
		return bootPromise;
	}

	bootPromise = ( async () => {
		try {
			const instance = createAngieMcpSdkInstance();

			await instance.registerServer( {
				name: INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
				version: '1.0.0',
				description: __( 'Inline text generation for atomic inline editing.', 'elementor' ),
				server: createInlineTextGeneratorMcpServer(),
				capabilities: {
					tools: {},
				},
			} );

			await instance.loadSidebarV2( getInlineTextGeneratorLoadSidebarOptions() );

			sdk = instance;

			return instance;
		} catch ( error ) {
			bootPromise = null;
			sdk = null;
			throw error;
		}
	} )();

	return bootPromise;
};

export const openInlineTextGeneratorWithPrompt = async ( anchor?: HTMLElement ) => {
	const instance = await bootInlineTextGeneratorSdk();

	if ( anchor ) {
		positionInlineTextGeneratorContainer( anchor );
	}

	openInlineTextGeneratorContainer();

	await instance.triggerAngie( {
		prompt: INLINE_TEXT_GENERATION_PROMPT,
		context: {
			source: INLINE_TEXT_GENERATOR_APP_ID,
		},
		options: {
			newChat: true,
		},
	} );
};
