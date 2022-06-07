import { ContextMenuManager } from 'elementor/packages/context-menu/manager';

describe( 'Context menu manager', () => {
	beforeAll( () => {
		global.structuredClone = ( object ) => JSON.parse( JSON.stringify( object ) );
	} );
	test( 'Check main flow', () => {
		const manager = new ContextMenuManager();

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

		expect( manager.getConfig( {} ) ).toEqual( [
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
						mouseEnter: null,
						mouseLeave: null,
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
						mouseEnter: null,
						mouseLeave: null,
					},
				],
			},
		] );
	} );

	test( 'updateGroup', () => {
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.updateGroup( 'groupId-1', { title: 'I am a title' } );

		expect( manager.getConfig( {} ) ).toEqual( [
			{
				title: 'I am a title',
				disabled: false,
				id: 'groupId-1',
				parentItemId: '',
				items: [],
			},
		] );
	} );

	test( 'updateItem', () => {
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1' }
		);

		manager.updateItem( 'groupId-1', 'item-1', { shortcut: '^ ctrl' } );

		expect( manager.getConfig( {} ) ).toEqual( [
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
						mouseEnter: null,
						mouseLeave: null,
						id: 'item-1',
						groups: [],
					},
				],
			},
		] );
	} );

	test( 'deleteGroup', () => {
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1' }
		);

		manager.createGroup(
			{ id: 'groupId-2' }
		);

		manager.deleteGroup( 'groupId-1' );

		expect( manager.getConfig( {} ) ).toEqual( [
			{
				title: '',
				disabled: false,
				id: 'groupId-2',
				parentItemId: '',
				items: [],
			},
		] );
	} );

	test( 'deleteItem', () => {
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

		manager.deleteItem( 'groupId-1', 'item-1' );

		expect( manager.getConfig( {} ) ).toEqual( [
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
						mouseEnter: null,
						mouseLeave: null,
						id: 'item-2',
						groups: [],
					},
				],
			},
		] );
	} );

	test( 'Validation of not authorized properties', () => {
		const manager = new ContextMenuManager();

		manager.createGroup(
			{ id: 'groupId-1', randomProperty: 7 }
		);

		manager.addItem(
			'groupId-1',
			{ id: 'item-1', groups: [ { id: 'some-id' } ] } // Cannot explicitly add groups inside items.
		);

		expect( manager.getConfig( {} ) ).toEqual( [
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
						mouseEnter: null,
						mouseLeave: null,
						id: 'item-1',
						groups: [],
					},
				],
			},
		] );
	} );
} );
