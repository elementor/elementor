jest.mock( 'elementor-editor-utils/editor-one-events', () => ( {
	EditorOneEventManager: {
		sendFinderResultSelect: jest.fn(),
	},
} ) );

describe( 'Finder item — app URL interception', () => {
	let ItemView;

	beforeEach( async () => {
		global.$e = {
			run: jest.fn(),
		};

		global.Marionette = {
			ItemView: class {
				$el = [ document.createElement( 'div' ) ];
				model = {
					get: jest.fn(),
				};
			},
		};

		global.__ = ( text ) => text;

		ItemView = ( await import( 'elementor/core/common/modules/finder/assets/js/modal/views/item' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.Marionette;
		jest.resetModules();
		jest.clearAllMocks();
	} );

	function createClickEvent() {
		const event = new Event( 'click', { bubbles: true, cancelable: true } );
		event.preventDefault = jest.fn();
		event.stopImmediatePropagation = jest.fn();
		return event;
	}

	it( 'should intercept app URLs and open in overlay', () => {
		const view = new ItemView();
		view.model.get.mockImplementation( ( key ) => {
			if ( key === 'lock' ) {
				return null;
			}
			if ( key === 'url' ) {
				return 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor';
			}
			return undefined;
		} );

		const event = createClickEvent();
		view.onClick( event );

		expect( event.preventDefault ).toHaveBeenCalled();
		expect( event.stopImmediatePropagation ).toHaveBeenCalled();
		expect( $e.run ).toHaveBeenCalledWith( 'finder/close' );
		expect( $e.run ).toHaveBeenCalledWith( 'app/open', {
			url: 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor',
		} );
	} );

	it( 'should not intercept non-app URLs', () => {
		const view = new ItemView();
		view.model.get.mockImplementation( ( key ) => {
			if ( key === 'lock' ) {
				return null;
			}
			if ( key === 'url' ) {
				return 'http://example.com/wp-admin/post.php?post=123&action=elementor';
			}
			return undefined;
		} );

		const event = createClickEvent();
		view.onClick( event );

		expect( event.preventDefault ).not.toHaveBeenCalled();
		expect( $e.run ).not.toHaveBeenCalled();
	} );

	it( 'should not intercept when $e is unavailable', () => {
		delete global.$e;

		const view = new ItemView();
		view.model.get.mockImplementation( ( key ) => {
			if ( key === 'lock' ) {
				return null;
			}
			if ( key === 'url' ) {
				return 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor';
			}
			return undefined;
		} );

		const event = createClickEvent();
		view.onClick( event );

		expect( event.preventDefault ).not.toHaveBeenCalled();
	} );
} );
