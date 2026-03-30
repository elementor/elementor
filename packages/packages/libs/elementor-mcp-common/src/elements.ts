import { ensureElementorFrontend, isGutenbergEditor } from './editor-detection';
import { get$e, getElementor, getElementorFrontend, getWp } from './utils';

interface GutenbergBlockEditorDispatch {
	updateBlockAttributes: ( clientId: string, attributes: Record< string, unknown > ) => void;
}

interface GutenbergBlockEditorSelect {
	getBlock: ( clientId: string ) => { name: string } | null;
}

interface GutenbergBlock {
	name: string;
}

export function injectElementCSS( elementId: string, css: string ): void {
	const style = document.createElement( 'style' );
	style.id = elementId;
	style.appendChild( document.createTextNode( css ) );

	ensureElementorFrontend();
	const frontend = getElementorFrontend() as { elements: { $body: HTMLElement[] } } | undefined;
	if ( frontend ) {
		frontend.elements.$body[ 0 ].appendChild( style );
	}
}

export function removeElementCSS( elementId: string ): void {
	ensureElementorFrontend();
	const frontend = getElementorFrontend() as { elements: { $body: HTMLElement[] } } | undefined;
	if ( ! frontend ) {
		return;
	}

	const bodyElement = frontend.elements.$body[ 0 ];
	const styleTags = bodyElement.querySelectorAll( `#${ CSS.escape( elementId ) }` );

	if ( styleTags?.length > 0 ) {
		styleTags.forEach( ( tag: Element ) => {
			bodyElement.removeChild( tag );
		} );
	}
}

export async function updateElementSettings( {
	id,
	settings,
}: {
	id: string;
	settings: Record< string, unknown >;
} ): Promise< unknown > {
	const containerToUpdateSettings = getElementor()?.getContainer( id );
	if ( ! containerToUpdateSettings ) {
		throw new Error( `Element with ID "${ id }" not found.` );
	}

	const updateResult = await get$e()?.run( 'document/elements/settings', {
		container: containerToUpdateSettings,
		settings,
		options: {
			external: true,
			render: true,
		},
	} );

	const frontend = getElementorFrontend() as { elements: { $body: { resize: () => void } } } | undefined;
	frontend?.elements.$body.resize();

	return updateResult;
}

export function getElementSettings( id: string ): unknown {
	const container = getElementor()?.getContainer( id );
	if ( ! container ) {
		throw new Error( `Element with ID "${ id }" not found.` );
	}
	return container.settings;
}

export function getGutenbergBlockEditorApis(): {
	blockEditorDispatch: GutenbergBlockEditorDispatch;
	blockEditorSelect: GutenbergBlockEditorSelect;
} {
	const wp = getWp();
	if ( ! isGutenbergEditor() || ! wp ) {
		throw new Error( 'WordPress editor API is not available' );
	}

	const blockEditorDispatch = wp.data.dispatch( 'core/block-editor' ) as unknown as GutenbergBlockEditorDispatch;
	const blockEditorSelect = wp.data.select( 'core/block-editor' ) as unknown as GutenbergBlockEditorSelect;

	if ( ! blockEditorDispatch || ! blockEditorSelect ) {
		throw new Error( 'Block editor API is not available' );
	}

	return { blockEditorDispatch, blockEditorSelect };
}

export function validateAndGetGutenbergBlock(
	blockEditorSelect: GutenbergBlockEditorSelect,
	blockId: string
): GutenbergBlock {
	const block = blockEditorSelect.getBlock( blockId );
	if ( ! block ) {
		throw new Error( `Block with ID "${ blockId }" not found` );
	}
	return block;
}

export function updateGutenbergBlockAttributes(
	blockId: string,
	attributes: Record< string, unknown >
): { blockId: string; blockName: string; updatedAttributes: string[] } {
	const { blockEditorDispatch, blockEditorSelect } = getGutenbergBlockEditorApis();
	const block = validateAndGetGutenbergBlock( blockEditorSelect, blockId );

	blockEditorDispatch.updateBlockAttributes( blockId, attributes );

	return {
		blockId,
		blockName: block.name,
		updatedAttributes: Object.keys( attributes ),
	};
}

export function extractElementImageData(
	targetElementId: string,
	fallbackImageId = '',
	fallbackImageUrl = ''
): { imageId: string; imageUrl: string } {
	let extractedImageId = fallbackImageId;
	let extractedImageUrl = fallbackImageUrl;

	if ( targetElementId && ( ! extractedImageId || ! extractedImageUrl ) ) {
		const targetContainer = getElementor()?.getContainer?.( targetElementId );
		if ( targetContainer ) {
			const imageData = targetContainer.settings.get( 'image' );
			if ( imageData && typeof imageData === 'object' ) {
				const imageObj = imageData as { id?: string | number; url?: string };
				extractedImageId = extractedImageId || imageObj.id?.toString() || '';
				extractedImageUrl = extractedImageUrl || imageObj.url || '';
			}
		}
	}

	return {
		imageId: extractedImageId,
		imageUrl: extractedImageUrl,
	};
}

export function isSelectAllCheckbox( input: HTMLInputElement ): boolean {
	if ( ( input.id && input.id.includes( 'select-all' ) ) || ( input.name && input.name.includes( 'select-all' ) ) ) {
		return true;
	}

	return false;
}
