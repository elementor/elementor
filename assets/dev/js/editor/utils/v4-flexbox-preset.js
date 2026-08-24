import { buildModel, createV4Element, runWithHistory } from './v4-preset-utils';

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

function buildTreeModel( definition ) {
	const { parent: parentProps, parentMobile, children = [] } = definition;
	const model = buildModel( V4_ELEMENT_TYPE, parentProps, parentMobile );

	model.elements = children.map( ( childDef ) => buildTreeModel( childDef ) );

	return model;
}

function buildNode( definition, target, options, isRoot ) {
	const { parent: parentProps, parentMobile, children } = definition;
	const reuseTarget = isRoot && false === options.createWrapper;
	const node = reuseTarget
		? ( target?.lookup?.() ?? target )
		: createV4Element( target, buildModel( V4_ELEMENT_TYPE, parentProps, parentMobile ), isRoot ? options : { edit: false } );

	children.forEach( ( childDef ) => {
		const hasNestedChildren = !! childDef.children?.length;

		if ( hasNestedChildren ) {
			createV4Element( node, buildTreeModel( childDef ), { edit: false } );
			return;
		}

		buildNode( childDef, node, options, false );
	} );

	return node;
}

export function createV4FlexboxFromPreset( preset, target = elementor.getPreviewContainer(), options = {} ) {
	return runWithHistory( __( 'Container', 'elementor' ), () => {
		const definition = getPresetDefinition( preset );

		return buildNode( definition, target, options, true );
	} );
}
