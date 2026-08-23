import { freeMock, setupMock } from 'elementor/tests/jest/unit/modules/web-cli/assets/js/core/mock/api';

/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */

describe( 'ContainerNestingSettings--document/elements/move', () => {
	let ContainerNestingSettings;

	beforeEach( async () => {
		await setupMock();

		( { ContainerNestingSettings } = await import( 'elementor-document/hooks/data/document/elements/move/container-nesting-settings' ) );
	} );

	afterEach( async () => {
		await freeMock();
	} );

	it( 'Should not run when the container is moved within the same parent', () => {
		// Arrange.
		const parent = createContainer( { type: 'container', id: 'parent' } );
		const container = createContainer( { type: 'container', id: 'child', parent } );
		const hook = new ContainerNestingSettings();

		// Act.
		const shouldRun = hook.getConditions( {
			container,
			target: parent,
		} );

		// Assert.
		expect( shouldRun ).toBe( false );
	} );

	it( 'Should run when the container is moved to a different parent', () => {
		// Arrange.
		const oldParent = createContainer( { type: 'container', id: 'old-parent' } );
		const newParent = createContainer( { type: 'container', id: 'new-parent' } );
		const container = createContainer( { type: 'container', id: 'child', parent: oldParent } );
		const hook = new ContainerNestingSettings();

		// Act.
		const shouldRun = hook.getConditions( {
			container,
			target: newParent,
		} );

		// Assert.
		expect( shouldRun ).toBe( true );
	} );

	it( 'Should set content_width to full when moved into a nested container', () => {
		// Arrange.
		const parent = createContainer( { type: 'container', id: 'parent' } );
		const movedContainer = createContainer( {
			type: 'container',
			id: 'moved',
			parent,
			isInner: false,
		} );
		const hook = new ContainerNestingSettings();
		const runSpy = jest.spyOn( $e, 'run' ).mockImplementation( () => {} );

		// Act.
		hook.apply( {}, movedContainer );

		// Assert.
		expect( runSpy ).toHaveBeenCalledWith( 'document/elements/settings', {
			container: movedContainer,
			settings: {
				content_width: 'full',
			},
		} );

		runSpy.mockRestore();
	} );

	it( 'Should set isInner to false when moved to the document root', () => {
		// Arrange.
		const documentContainer = createContainer( { type: 'document', id: 'document' } );
		const movedContainer = createContainer( {
			type: 'container',
			id: 'moved',
			parent: documentContainer,
			isInner: true,
		} );
		const hook = new ContainerNestingSettings();
		const runSpy = jest.spyOn( $e, 'run' ).mockImplementation( () => {} );

		// Act.
		hook.apply( {}, movedContainer );

		// Assert.
		expect( movedContainer.model.get( 'isInner' ) ).toBe( false );
		expect( runSpy ).not.toHaveBeenCalled();

		runSpy.mockRestore();
	} );
} );

/**
 * @param {{}}      el
 * @param {string}  el.type
 * @param {string}  el.id
 * @param {boolean} el.isInner
 * @param {Object}  el.parent
 * @return {Container} The new created container
 */
function createContainer( {
	type,
	id,
	isInner = false,
	parent = null,
} = {} ) {
	const model = {
		attributes: {
			elType: type,
			isInner,
		},
		get( key ) {
			return this.attributes[ key ];
		},
		set( key, value ) {
			this.attributes[ key ] = value;
		},
	};

	const container = {
		id,
		model,
		parent,
	};

	if ( parent ) {
		parent.children = parent.children || [];
		parent.children.push( container );
	}

	return container;
}
