import { type V1ElementConfig } from '@elementor/editor-elements';

export const DIV_BLOCK_TAG = 'e-div-block';

export const ZERO_SPACING = {
	$$type: 'size',
	value: {
		size: {
			$$type: 'number',
			value: 0,
		},
		unit: {
			$$type: 'string',
			value: 'px',
		},
	},
};

export type BuildCompositionParams = {
	xmlStructure: string;
	stylesConfig: Record< string, Record< string, unknown > >;
	widgetsCache: Record< string, V1ElementConfig >;
	elementConfig: Record< string, Record< string, unknown > >;
	[ key: string ]: unknown;
};

export function adaptLeafRootParams< T extends BuildCompositionParams >( params: T ): T {
	const doc = new DOMParser().parseFromString( params.xmlStructure, 'application/xml' );
	const rootElement = doc.documentElement;

	if ( ! isLeafWidget( rootElement.tagName, params.widgetsCache ) ) {
		return params;
	}

	const wrapperConfigId = getDivBlockWrapperConfigId( params.widgetsCache );

	return {
		...params,
		xmlStructure: serializeWrapped( doc, rootElement, wrapperConfigId ),
		stylesConfig: {
			...params.stylesConfig,
			[ wrapperConfigId ]: {
				margin: ZERO_SPACING,
				padding: ZERO_SPACING,
				...params.stylesConfig[ wrapperConfigId ],
			},
		},
	};
}

function getDivBlockWrapperConfigId( widgetsCache: Record< string, V1ElementConfig > ): string {
	return widgetsCache[ DIV_BLOCK_TAG ]?.title ?? DIV_BLOCK_TAG;
}

function isLeafWidget( tagName: string, widgetsCache: Record< string, V1ElementConfig > ): boolean {
	return widgetsCache[ tagName ]?.elType === 'widget';
}

function serializeWrapped( doc: Document, rootElement: Element, wrapperConfigId: string ): string {
	const wrapper = doc.createElement( DIV_BLOCK_TAG );
	wrapper.setAttribute( 'configuration-id', wrapperConfigId );
	wrapper.appendChild( rootElement.cloneNode( true ) );

	const wrappedDoc = new DOMParser().parseFromString( `<${ DIV_BLOCK_TAG } />`, 'application/xml' );
	wrappedDoc.replaceChild( wrapper, wrappedDoc.documentElement );

	return new XMLSerializer().serializeToString( wrappedDoc );
}
