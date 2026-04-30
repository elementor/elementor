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
	width: sizeProp( size, '%' ),
} );

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

function createFlexbox( cssProps, target, options = {} ) {
	const flexbox = createFlexboxElement( target, options );

	attachLocalStyle( flexbox, cssProps );

	return flexbox;
}

function createFlexboxFromSizes( sizes, target, options = {} ) {
	const { createWrapper = true } = options;
	const sizesSum = sizes.reduce( ( sum, size ) => sum + size, 0 );
const numericSizes = sizes.map( ( s ) => Number( s ) );
const sizesSum = numericSizes.reduce( ( sum, size ) => sum + size, 0 );

	const parentProps = {
		'flex-direction': stringProp( DIRECTION_ROW ),
		gap: sizeProp( 0, 'px' ),
		...( shouldWrap ? { 'flex-wrap': stringProp( 'wrap' ) } : {} ),
	};

	let parent;

	if ( createWrapper ) {
		parent = createFlexbox( parentProps, target, options );
	} else {
		attachLocalStyle( target, parentProps );
		parent = target;
	}

	sizes.forEach( ( size ) => {
		const resolved = SIZES_MAP[ size ] || size;

		createFlexbox( widthPercent( resolved ), parent, { edit: false } );
	} );

	return parent;
}

export function createV4FlexboxFromPreset( preset, target = elementor.getPreviewContainer(), options = {} ) {
	const historyId = $e.internal( 'document/history/start-log', {
		type: 'add',
		title: __( 'Container', 'elementor' ),
	} );
	const { createWrapper = true } = options;

	let result;

	try {
		switch ( preset ) {
			case 'c100':
				result = createFlexbox( {}, target, options );
				break;

			case 'r100':
				result = createFlexbox(
					{ 'flex-direction': stringProp( DIRECTION_ROW ) },
					target,
					options,
				);
				break;

			case 'c100-c50-50': {
				const parentProps = {
					'flex-direction': stringProp( DIRECTION_ROW ),
					gap: sizeProp( 0, 'px' ),
				};

				if ( createWrapper ) {
					result = createFlexbox( parentProps, target, options );
				} else {
					attachLocalStyle( target, parentProps );
					result = target;
				}

				createFlexbox( widthPercent( 50 ), result, { edit: false } );

				const rightSide = createFlexbox(
					{
						...widthPercent( 50 ),
						padding: sizeProp( 0, 'px' ),
						gap: sizeProp( 0, 'px' ),
					},
					result,
					{ edit: false },
				);

				for ( let i = 0; i < 2; i++ ) {
					createFlexbox( {}, rightSide, { edit: false } );
				}

				break;
			}

			default:
				result = createFlexboxFromSizes( preset.split( '-' ), target, options );
		}

		$e.internal( 'document/history/end-log', { id: historyId } );
	} catch ( e ) {
		$e.internal( 'document/history/delete-log', { id: historyId } );
	}

	return result;
}
