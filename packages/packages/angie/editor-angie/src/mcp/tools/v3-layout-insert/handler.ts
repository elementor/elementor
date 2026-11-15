const TOOL_NAME = 'v3-layout-insert';
const ALLOWED_EL_TYPES = [ 'section', 'column', 'container', 'widget' ] as const;

export type V3LayoutElementModel = {
	elType: string;
	widgetType?: string;
	id?: string;
	elements?: V3LayoutElementModel[];
	settings?: Record< string, unknown >;
};

export type V3LayoutInsertParams = {
	parentContainerId?: string;
	at?: number;
	elements: V3LayoutElementModel | V3LayoutElementModel[];
	replaceElementId?: string;
	historyTitle?: string;
};

type InsertLayoutResult = {
	success: true;
	parentContainerId: string;
	insertedElementIds: string[];
	at: number;
};

type ElementorContainer = {
	id: string;
	children: { at: ( index: number ) => unknown };
};

const getElementor = () =>
	(
		window as unknown as {
			elementor?: {
				getContainer?: ( id: string ) => ElementorContainer | null | undefined;
				getPreviewContainer?: () => ElementorContainer;
				helpers?: {
					isAtomicWidget?: ( model: unknown ) => boolean;
				};
				getConfig?: () => { elements?: Record< string, { meta?: { is_compound?: boolean } } > };
			};
			widgetsCache?: Record< string, unknown >;
		}
	 ).elementor;

const getCommands = () =>
	(
		window as unknown as {
			$e?: {
				run?: ( command: string, args?: Record< string, unknown > ) => Promise< unknown > | unknown;
				internal?: ( command: string, args?: Record< string, unknown > ) => unknown;
			};
		}
	 ).$e;

const getUniqueId = () => Math.random().toString( 16 ).slice( 2, 9 );

const assignFreshIds = ( model: V3LayoutElementModel ): V3LayoutElementModel => {
	const cloned = { ...model, id: getUniqueId() };

	if ( cloned.elements?.length ) {
		cloned.elements = cloned.elements.map( ( child ) => assignFreshIds( child ) );
	}

	return cloned;
};

const isCompoundAtomicElType = ( elType: string ): boolean => {
	const elementsConfig = getElementor()?.getConfig?.()?.elements;

	return Boolean( elementsConfig?.[ elType ]?.meta?.is_compound );
};

const assertV3LayoutElement = ( model: V3LayoutElementModel, path = 'root' ): void => {
	const { elType, widgetType } = model;

	if ( ! elType ) {
		throw new Error( `Element at ${ path } is missing elType.` );
	}

	if ( elType.startsWith( 'e-' ) || isCompoundAtomicElType( elType ) ) {
		throw new Error(
			`Element at ${ path } has type "${ elType }" which is not supported by ${ TOOL_NAME } (V4/atomic only).`
		);
	}

	if ( ! ( ALLOWED_EL_TYPES as readonly string[] ).includes( elType ) ) {
		throw new Error(
			`Element at ${ path } has unsupported elType "${ elType }". Allowed: ${ ALLOWED_EL_TYPES.join( ', ' ) }.`
		);
	}

	const elementor = getElementor();

	if ( elementor?.helpers?.isAtomicWidget?.( model ) ) {
		throw new Error( `Element at ${ path } is an atomic widget and is not supported by ${ TOOL_NAME }.` );
	}

	if ( 'widget' === elType ) {
		const widgetsCache = ( window as unknown as { elementor?: { widgetsCache?: Record< string, unknown > } } )
			.elementor?.widgetsCache;

		if ( ! widgetType || ! widgetsCache?.[ widgetType ] ) {
			throw new Error( `Unknown widget type "${ widgetType ?? '' }" at ${ path }.` );
		}
	}

	model.elements?.forEach( ( child, index ) => assertV3LayoutElement( child, `${ path }.elements[${ index }]` ) );
};

const resolveParentContainer = ( parentContainerId?: string ): ElementorContainer => {
	const elementor = getElementor();

	if ( ! elementor ) {
		throw new Error( 'Elementor editor is not available.' );
	}

	if ( parentContainerId ) {
		const container = elementor.getContainer?.( parentContainerId );

		if ( ! container ) {
			throw new Error( `Parent container "${ parentContainerId }" was not found.` );
		}

		return container;
	}

	const previewContainer = elementor.getPreviewContainer?.();

	if ( ! previewContainer ) {
		throw new Error( 'Preview container is not available.' );
	}

	return previewContainer;
};

export const insertV3Layout = async ( params: V3LayoutInsertParams ): Promise< InsertLayoutResult > => {
	const run = getCommands()?.run;
	const internal = getCommands()?.internal;

	if ( ! run || ! internal ) {
		throw new Error( 'Elementor commands API is not available.' );
	}

	const models = ( Array.isArray( params.elements ) ? params.elements : [ params.elements ] ).map( assignFreshIds );

	models.forEach( ( model, index ) => assertV3LayoutElement( model, `elements[${ index }]` ) );

	const parentContainer = resolveParentContainer( params.parentContainerId );
	const at = 'number' === typeof params.at ? params.at : 0;

	if ( params.replaceElementId ) {
		const target = getElementor()?.getContainer?.( params.replaceElementId );

		if ( ! target ) {
			throw new Error( `replaceElementId "${ params.replaceElementId }" was not found.` );
		}

		await run( 'document/elements/delete', { container: target } );
	}

	const historyId = internal( 'document/history/start-log', {
		type: 'import',
		title: params.historyTitle || 'AI Layout',
	} );

	let insertAt = at;
	const insertedElementIds: string[] = [];

	try {
		for ( const model of models ) {
			const created = ( await run( 'document/elements/create', {
				container: parentContainer,
				model,
				options: {
					at: insertAt,
					edit: false,
				},
			} ) ) as { id?: string } | undefined;

			if ( created?.id ) {
				insertedElementIds.push( created.id );
			}

			insertAt++;
		}
	} finally {
		internal( 'document/history/end-log', { id: historyId } );
	}

	return {
		success: true,
		parentContainerId: parentContainer.id,
		insertedElementIds,
		at,
	};
};

export const handleV3LayoutInsertTool = async ( params: V3LayoutInsertParams ): Promise< InsertLayoutResult > => {
	if ( ! params.elements ) {
		throw new Error( 'elements are required.' );
	}

	return insertV3Layout( params );
};
