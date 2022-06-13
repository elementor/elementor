import { ContextMenuManager } from 'elementor/packages/context-menu/context-menu-manager';

describe( 'ContextMenuManager', () => {
	beforeAll( () => {
		// The global 'structuredClone' is not supported yet at jest.
		global.structuredClone = ( object ) => JSON.parse( JSON.stringify( object ) );
	} );

	it( 'Should check the main flow', () => {
		// Arrange
		const manager = new ContextMenuManager();

		// Act
		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.createGroup(
			{ id: 'groupId-2', parentItemId: 'item-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-2' }
		);

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [
					{
						label: '',
						icon: false,
						shortcut: '',
						badge: null,
						action: null,
						onMouseEnter: null,
						onMouseLeave: null,
						id: 'item-1',
						groups: [
							{
								id: 'groupId-2',
								title: '',
								items: [],
								parentItemId: 'item-1',
								disabled: false,
							},
						],
					},
					{
						id: 'item-2',
						groups: [],
						label: '',
						icon: false,
						shortcut: '',
						badge: null,
						action: null,
						onMouseEnter: null,
						onMouseLeave: null,
					},
				],
			},
		] );
	} );

	it( 'Should update a group', () => {
		// Arrange
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		// Act
		manager.updateGroup( 'groupId-1', { title: 'I am a title' } );

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: 'I am a title',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [],
			},
		] );
	} );

	it( 'Should update an item', () => {
		// Arrange
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1' }
		);

		// Act
		manager.updateItem( 'groupId-1', 'item-1', { shortcut: '^ ctrl' } );

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [
					{
						label: '',
						icon: false,
						shortcut: '^ ctrl',
						badge: null,
						action: null,
						onMouseEnter: null,
						onMouseLeave: null,
						id: 'item-1',
						groups: [],
					},
				],
			},
		] );
	} );

	it( 'Should delete a group', () => {
		// Arrange
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.createGroup(
			{ id: 'groupId-2' }
		);

		// Act
		manager.deleteGroup( 'groupId-1' );

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-2',
				parentItemId: '',
				items: [],
			},
		] );
	} );

	it( 'Should delete an item', () => {
		// Arrange
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-2' }
		);

		// Act
		manager.deleteItem( 'groupId-1', 'item-1' );

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [
					{
						label: '',
						icon: false,
						shortcut: '',
						badge: null,
						action: null,
						onMouseEnter: null,
						onMouseLeave: null,
						id: 'item-2',
						groups: [],
					},
				],
			},
		] );
	} );

	it( 'Should test validation of unauthorized properties', () => {
		// Arrange
		const manager = new ContextMenuManager();

		// Act
		manager.createGroup(
			{ id: 'groupId-1', randomProperty: 7 }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1', groups: [ { id: 'some-id' } ] } // Cannot explicitly add groups inside items.
		);

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [
					{
						label: '',
						icon: false,
						shortcut: '',
						badge: null,
						action: null,
						onMouseEnter: null,
						onMouseLeave: null,
						id: 'item-1',
						groups: [],
					},
				],
			},
		] );
	} );

	it( 'Should test validation of not existing groups', () => {
		// Arrange
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		// Act
		manager.addItem(
			'groupId-18',
			{ id: 'item-1' }
		);

		manager.updateGroup( 'groupId-7', { title: 'I am a title' } );

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [],
			},
		] );
	} );

	it( 'Should test preventing duplicating groups and items', () => {
		// Arrange
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1' }
		);

		// Act
		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1' }
		);

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [
					{
						label: '',
						icon: false,
						shortcut: '',
						badge: null,
						action: null,
						onMouseEnter: null,
						onMouseLeave: null,
						id: 'item-1',
						groups: [],
					},
				],
			},
		] );
	} );

	it( 'Should not display groups that their parentItemId points to non-existing items', () => {
		// Arrange
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		// Act
		manager.createGroup(
			{ id: 'groupId-2', parentItemId: 'groupId-7' }
		);

		// Assert
		expect( manager.getConfig() ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [],
			},
		] );
	} );

	it( 'Should not display groups that their parentItemId points to self descendant items', () => {
		// Arrange
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1' }
		);

		// Act
		manager.updateGroup( 'groupId-1', { parentItemId: 'item-1' } );

		// Assert
		expect( manager.getConfig() ).toEqual( [] );
	} );
} );
