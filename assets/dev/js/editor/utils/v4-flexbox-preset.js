const V4_ELEMENT_TYPE = 'e-flexbox';
const DIRECTION_ROW = 'row';
const DIRECTION_COLUMN = 'column';

const SIZES_MAP = {
	33: '33.3333',
	66: '66.6666',
};

const sizeProp = ( size, unit = 'px' ) => ( {
	$$type: 'size',
	value: { size, unit },
} );

const stringProp = ( value ) => ( {
	$$type: 'string',
	value,
} );

const widthPercent = ( size ) => ( {
	width: sizeProp( Number( SIZES_MAP[ size ] ?? size ), '%' ),
} );

const FULL_WIDTH_MOBILE = { width: sizeProp( 100, '%' ) };

const ROW = { 'flex-direction': stringProp( DIRECTION_ROW ) };
const COLUMN = { 'flex-direction': stringProp( DIRECTION_COLUMN ) };
const ROW_WRAP = { ...ROW, 'flex-wrap': stringProp( 'wrap' ) };

const widthChild = ( size ) => ( {
	parent: { ...COLUMN, ...widthPercent( size ) },
	parentMobile: FULL_WIDTH_MOBILE,
	children: [],
} );
const bareChild = () => ( { parent: COLUMN, children: [] } );

const rowOfSizes = ( sizes ) => {
	const sum = sizes.reduce( ( s, n ) => s + Number( n ), 0 );

	return {
		parent: sum > 100 ? ROW_WRAP : ROW,
		children: sizes.map( widthChild ),
	};
};

const PRESET_DEFINITIONS = {
	c100: { parent: COLUMN, children: [] },
	r100: { parent: ROW, children: [] },
	'c100-c50-50': {
		parent: ROW,
		children: [
			widthChild( '50' ),
			{
				parent: { ...COLUMN, ...widthPercent( '50' ), padding: sizeProp( 0, 'px' ) },
				parentMobile: FULL_WIDTH_MOBILE,
				children: [ bareChild(), bareChild() ],
			},
		],
	},
};

function getPresetDefinition( preset ) {
	if ( PRESET_DEFINITIONS[ preset ] ) {
		return PRESET_DEFINITIONS[ preset ];
	}

	return rowOfSizes( preset.split( '-' ) );
}

function buildModel( cssProps, mobileProps ) {
	const model = {
		id: elementorCommon.helpers.getUniqueId(),
		elType: V4_ELEMENT_TYPE,
		elements: [],
	};

	const hasBase = cssProps && Object.keys( cssProps ).length > 0;
	const hasMobile = mobileProps && Object.keys( mobileProps ).length > 0;

	if ( ! hasBase && ! hasMobile ) {
		return model;
	}

	const styleId = `e-${ elementorCommon.helpers.getUniqueId() }`;
	const variants = [
		{
			meta: { breakpoint: 'desktop', state: null },
			props: cssProps ?? {},
			custom_css: null,
		},
	];

	if ( hasMobile ) {
		variants.push( {
			meta: { breakpoint: 'mobile', state: null },
			props: mobileProps,
			custom_css: null,
		} );
	}

	model.styles = {
		[ styleId ]: {
			id: styleId,
			label: 'local',
			type: 'class',
			variants,
		},
	};

	model.settings = {
		classes: { $$type: 'classes', value: [ styleId ] },
	};

	return model;
}

function buildTreeModel( definition ) {
	const { parent: parentProps, parentMobile, children = [] } = definition;
	const model = buildModel( parentProps, parentMobile );

	model.elements = children.map( ( childDef ) => buildTreeModel( childDef ) );

	return model;
}

function createFlexboxElement( target, model, options ) {
	const containerClass = elementorModules?.editor?.Container;
	const getDocumentUtils = () => $e?.components?.get?.( 'document' )?.utils;
	const getContainerById = ( id ) => getDocumentUtils()?.findContainerById?.( id ) ?? null;
	const isContainerInstance = ( candidate ) => {
		if ( ! containerClass || ! candidate ) {
			return false;
		}

		return candidate instanceof containerClass ||
			candidate.constructor?.name === containerClass.prototype?.[ Symbol.toStringTag ];
	};
	const resolveContainer = ( candidate ) => {
		if ( ! containerClass ) {
			return candidate;
		}

		if ( isContainerInstance( candidate ) ) {
			return candidate;
		}

		const lookedUp = candidate?.lookup?.();
		if ( isContainerInstance( lookedUp ) ) {
			return lookedUp;
		}

		const byId = candidate?.id ? getContainerById( candidate.id ) : null;
		if ( isContainerInstance( byId ) ) {
			return byId;
		}

		return null;
	};

	const resolvedTarget = resolveContainer( target );

	if ( ! resolvedTarget && containerClass && target?.id ) {
		getDocumentUtils()?.addModelToParent?.( target.id, model, options );

		const inserted = getContainerById( model.id );
		if ( inserted ) {
			return inserted;
		}

		return {
			id: model.id,
			lookup: () => getContainerById( model.id ),
		};
	}

	const created = $e.run( 'document/elements/create', {
		container: resolvedTarget ?? target,
		model,
		...options,
	} );

	const resolvedCreated = resolveContainer( created );

	if ( resolvedCreated || ! containerClass ) {
		return resolvedCreated ?? created;
	}

	return {
		id: model.id,
		lookup: () => getContainerById( model.id ),
	};
}

function buildNode( definition, target, options, isRoot ) {
	const { parent: parentProps, parentMobile, children } = definition;
	const reuseTarget = isRoot && false === options.createWrapper;
	const node = reuseTarget
		? ( target?.lookup?.() ?? target )
		: createFlexboxElement( target, buildModel( parentProps, parentMobile ), isRoot ? options : { edit: false } );

	children.forEach( ( childDef ) => {
		const hasNestedChildren = !! childDef.children?.length;

		if ( hasNestedChildren ) {
			createFlexboxElement( node, buildTreeModel( childDef ), { edit: false } );
			return;
		}

		buildNode( childDef, node, options, false );
	} );

	return node;
}

export function createV4FlexboxFromPreset( preset, target = elementor.getPreviewContainer(), options = {} ) {
	const historyId = $e.internal( 'document/history/start-log', {
		type: 'add',
		title: __( 'Container', 'elementor' ),
	} );

	let result;

	try {
		const definition = getPresetDefinition( preset );

		result = buildNode( definition, target, options, true );

		$e.internal( 'document/history/end-log', { id: historyId } );
	} catch ( e ) {
		$e.internal( 'document/history/delete-log', { id: historyId } );
	}

	return result;
}
