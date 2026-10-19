jest.mock( 'elementor-controls/behaviors/scrubbing', () => ( {} ) );

jest.mock( 'elementor-controls/base-units', () => {
	class ControlBaseUnitsItemView {
		static extend( properties ) {
			class ControlView extends ControlBaseUnitsItemView {}

			Object.assign( ControlView.prototype, properties );

			return ControlView;
		}
	}

	ControlBaseUnitsItemView.prototype.updateElementModel = jest.fn( function( value, input ) {
		this.setValue( input.dataset.setting, value );
	} );

	return ControlBaseUnitsItemView;
} );

const ControlBaseUnitsItemView = require( 'elementor-controls/base-units' );
const ControlDimensionsItemView = require( 'elementor-controls/dimensions' );

const DIMENSIONS = [ 'top', 'right', 'bottom', 'left' ];

/**
 * A minimal stand-in for the jQuery collection of the dimension inputs (`this.ui.controls`).
 *
 * @param {Object} values - Initial input values, keyed by dimension.
 * @return {Object} collection
 */
function createInputs( values = {} ) {
	const items = DIMENSIONS.map( ( setting ) => ( { setting, value: values[ setting ] ?? '' } ) );

	const createCollection = ( collectionItems ) => ( {
		items: collectionItems,
		length: collectionItems.length,
		filter( selector ) {
			const setting = selector.match( /data-setting="(\w+)"/ )[ 1 ];

			return createCollection( collectionItems.filter( ( item ) => item.setting === setting ) );
		},
		eq( index ) {
			return createCollection( collectionItems.slice( index, index + 1 ) );
		},
		data( key ) {
			return 'setting' === key ? collectionItems[ 0 ]?.setting : undefined;
		},
		val( value ) {
			if ( undefined === value ) {
				return collectionItems[ 0 ]?.value;
			}

			collectionItems.forEach( ( item ) => {
				item.value = String( value );
			} );

			return this;
		},
		toObject() {
			return Object.fromEntries( collectionItems.map( ( item ) => [ item.setting, item.value ] ) );
		},
	} );

	return createCollection( items );
}

/**
 * Create a dimensions control view with the base control behavior replaced by plain data.
 *
 * @param {Object} options
 * @param {Object} options.value       - The stored control value.
 * @param {Object} options.placeholder - The placeholder inherited from the responsive parent.
 * @param {Object} options.parentView  - The responsive parent view, if any.
 * @param {Object} options.inputs      - Initial input values, keyed by dimension.
 * @return {Object} view
 */
function createView( { value = {}, placeholder, parentView, inputs = {} } = {} ) {
	const view = new ControlDimensionsItemView(),
		storedValue = { isLinked: true, unit: 'px', ...value };

	view.model = {
		get: ( key ) => ( { allowed_dimensions: DIMENSIONS } )[ key ],
	};

	view.ui = {
		controls: createInputs( inputs ),
		link: { toggleClass: jest.fn() },
	};

	view.getControlValue = ( key ) => {
		if ( key ) {
			return storedValue[ key ] ?? '';
		}

		return { ...storedValue };
	};

	view.setValue = jest.fn( ( key, newValue ) => {
		if ( 'object' === typeof key ) {
			Object.assign( storedValue, key );
		} else {
			storedValue[ key ] = newValue;
		}
	} );

	view.getControlPlaceholder = () => placeholder;
	view.getResponsiveParentView = () => parentView;

	return view;
}

function createParentView( { isLinked } ) {
	return { isLinkedDimensions: () => isLinked };
}

describe( 'assets/dev/js/editor/controls/dimensions.js', () => {
	beforeAll( () => {
		global._ = {
			isObject: ( value ) => null !== value && 'object' === typeof value,
			isArray: Array.isArray,
			isEmpty: ( value ) => {
				if ( null === value || undefined === value ) {
					return true;
				}

				if ( 'string' === typeof value || Array.isArray( value ) ) {
					return 0 === value.length;
				}

				return 'object' !== typeof value || 0 === Object.keys( value ).length;
			},
			indexOf: ( array, item ) => array.indexOf( item ),
			contains: ( array, item ) => array.includes( item ),
		};
	} );

	afterAll( () => {
		delete global._;
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'isLinkedDimensions()', () => {
		it( 'should follow the responsive parent when the control has no values of its own', () => {
			const view = createView( { parentView: createParentView( { isLinked: false } ) } );

			expect( view.isLinkedDimensions() ).toBe( false );
		} );

		it( 'should keep an explicit unlinked state even when the responsive parent is linked', () => {
			const view = createView( {
				value: { isLinked: false },
				parentView: createParentView( { isLinked: true } ),
			} );

			expect( view.isLinkedDimensions() ).toBe( false );
		} );

		it( 'should use the stored state once the control has a value of its own', () => {
			const view = createView( {
				value: { top: '10' },
				parentView: createParentView( { isLinked: false } ),
			} );

			expect( view.isLinkedDimensions() ).toBe( true );
		} );

		it( 'should use the stored state when there is no responsive parent view', () => {
			const view = createView( { parentView: undefined } );

			expect( view.isLinkedDimensions() ).toBe( true );
		} );
	} );

	describe( 'fillEmptyDimensions()', () => {
		it( 'should fill empty inputs with the inherited values when the control is unlinked', () => {
			const view = createView( {
				value: { isLinked: false },
				placeholder: { top: 10, right: 20, bottom: 30, left: 40 },
				inputs: { top: '5' },
			} );

			view.fillEmptyDimensions();

			expect( view.ui.controls.toObject() ).toEqual( { top: '5', right: '20', bottom: '30', left: '40' } );
		} );

		it( 'should fall back to the default only for dimensions that have nothing to inherit', () => {
			const view = createView( {
				value: { isLinked: false },
				placeholder: { top: 10, right: '' },
			} );

			view.fillEmptyDimensions();

			expect( view.ui.controls.toObject() ).toEqual( { top: '10', right: '0', bottom: '0', left: '0' } );
		} );

		it( 'should keep inherited inputs empty when `keepInherited` is set', () => {
			const view = createView( {
				value: { isLinked: false },
				placeholder: { top: 10, bottom: 30 },
			} );

			view.fillEmptyDimensions( { keepInherited: true } );

			expect( view.ui.controls.toObject() ).toEqual( { top: '', right: '0', bottom: '', left: '0' } );
		} );

		it( 'should not touch the inputs when the control is linked', () => {
			const view = createView( { placeholder: { top: 10, right: 20, bottom: 30, left: 40 } } );

			view.fillEmptyDimensions();

			expect( view.ui.controls.toObject() ).toEqual( { top: '', right: '', bottom: '', left: '' } );
		} );
	} );

	describe( 'onLinkDimensionsClicked()', () => {
		const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() };

		it( 'should unlink with the inherited values when the parent is linked', () => {
			const view = createView( {
				placeholder: { top: 10, right: 20, bottom: 30, left: 40 },
				parentView: createParentView( { isLinked: true } ),
			} );

			view.onLinkDimensionsClicked( event );

			expect( view.getControlValue() ).toMatchObject( { isLinked: false, top: '10', right: '20', bottom: '30', left: '40' } );
			expect( view.ui.link.toggleClass ).toHaveBeenCalledWith( 'unlinked', true );
		} );

		it( 'should link with the inherited value of the first dimension when the parent is unlinked', () => {
			const view = createView( {
				placeholder: { top: 10, right: 20, bottom: 30, left: 40 },
				parentView: createParentView( { isLinked: false } ),
			} );

			view.onLinkDimensionsClicked( event );

			expect( view.getControlValue() ).toMatchObject( { isLinked: true, top: '10', right: '10', bottom: '10', left: '10' } );
			expect( view.isLinkedDimensions() ).toBe( true );
			expect( view.ui.link.toggleClass ).toHaveBeenCalledWith( 'unlinked', false );
		} );

		it( 'should link all dimensions with the default value when the first dimension has nothing to inherit', () => {
			const view = createView( {
				placeholder: { right: 20, left: 40 },
				parentView: createParentView( { isLinked: false } ),
			} );

			view.onLinkDimensionsClicked( event );

			expect( view.getControlValue() ).toMatchObject( { isLinked: true, top: '0', right: '0', bottom: '0', left: '0' } );
			expect( view.isLinkedDimensions() ).toBe( true );
		} );

		it( 'should keep empty values when linking a control without a responsive parent', () => {
			const view = createView( { value: { isLinked: false } } );

			view.onLinkDimensionsClicked( event );

			expect( view.getControlValue() ).toMatchObject( { isLinked: true, top: '', right: '', bottom: '', left: '' } );
		} );
	} );

	describe( 'updateElementModel()', () => {
		const input = { dataset: { setting: 'top' } };

		it( 'should persist the inherited unlinked state before the base control saves the value', () => {
			const view = createView( { parentView: createParentView( { isLinked: false } ) } );

			view.updateElementModel( '10', input );

			expect( view.setValue ).toHaveBeenNthCalledWith( 1, 'isLinked', false );
			expect( ControlBaseUnitsItemView.prototype.updateElementModel ).toHaveBeenCalledWith( '10', input );
			expect( view.getControlValue() ).toMatchObject( { isLinked: false, top: '10' } );
		} );

		it( 'should only delegate to the base control when the link state is not inherited', () => {
			const view = createView( { parentView: createParentView( { isLinked: true } ) } );

			view.updateElementModel( '10', input );

			expect( view.setValue ).toHaveBeenCalledTimes( 1 );
			expect( ControlBaseUnitsItemView.prototype.updateElementModel ).toHaveBeenCalledWith( '10', input );
			expect( view.getControlValue() ).toMatchObject( { isLinked: true, top: '10' } );
		} );
	} );
} );
