const V4_ELEMENT_TYPE = 'e-flexbox';
const STYLE_CHANGE_EVENT = 'elementor/editor-v2/editor-elements/style';
const DIRECTION_ROW = 'row';

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

const ROW = { 'flex-direction': stringProp( DIRECTION_ROW ) };
const ROW_WRAP = { ...ROW, 'flex-wrap': stringProp( 'wrap' ) };

const widthChild = ( size ) => ( { parent: widthPercent( size ), children: [] } );
const bareChild = () => ( { parent: {}, children: [] } );

const rowOfSizes = ( sizes ) => {
	const sum = sizes.reduce( ( s, n ) => s + parseInt( n ), 0 );

	return {
		parent: sum > 100 ? ROW_WRAP : ROW,
		children: sizes.map( widthChild ),
	};
};

const PRESET_DEFINITIONS = {
	c100: { parent: {}, children: [] },
	r100: { parent: ROW, children: [] },
	'c100-c50-50': {
		parent: ROW,
		children: [
			widthChild( '50' ),
			{
				parent: { ...widthPercent( '50' ), padding: sizeProp( 0, 'px' ) },
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

function createFlexboxElement( target, options ) {
	return $e.run( 'document/elements/create', {
		container: target,
		model: { elType: V4_ELEMENT_TYPE },
		options,
	} );
}

function attachLocalStyle( container, cssProps ) {
	if ( ! cssProps || 0 === Object.keys( cssProps ).length ) {
		return null;
	}

	const existingStyles = structuredClone( container.model.get( 'styles' ) ?? {} );
	const styleId = `e-${ container.id }-${ elementorCommon.helpers.getUniqueId() }`;

	existingStyles[ styleId ] = {
		id: styleId,
		label: 'local',
		type: 'class',
		variants: [
			{
				meta: { breakpoint: null, state: null },
				props: cssProps,
				custom_css: null,
			},
		],
	};

	container.model.set( 'styles', existingStyles );

	const existingClasses = container.settings?.get?.( 'classes' );
	const prevValue = Array.isArray( existingClasses?.value ) ? existingClasses.value : [];

	$e.internal( 'document/elements/set-settings', {
		container,
		settings: {
			classes: {
				$$type: 'classes',
				value: [ ...prevValue, styleId ],
			},
		},
	} );

	window.dispatchEvent( new CustomEvent( STYLE_CHANGE_EVENT ) );

	return styleId;
}

function buildNode( definition, target, options, isRoot ) {
	const { parent: parentProps, children } = definition;
	const reuseTarget = isRoot && false === options.createWrapper;
	const node = reuseTarget
		? target
		: createFlexboxElement( target, isRoot ? options : { edit: false } );

	attachLocalStyle( node, parentProps );

	children.forEach( ( childDef ) => {
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
