import { ContextMenuManager } from 'elementor/packages/context-menu/manager';

describe( 'Context menu manager', () => {
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

		expect( manager.getConfig( {} ) ).toEqual( {
			dimensions: {},
			groupsTree: [
				{
					id: 'groupId-1',
					items: [
						{
							id: 'item-1',
							groups: [
								{
									id: 'groupId-2',
									items: [],
									parentItemId: 'item-1',
								},
							],
						},
						{
							id: 'item-2',
							groups: [],
						},
					],
					parentItemId: '',
				},
			],
		} );
	} );

	test( 'updateGroup', () => {
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

		manager.updateGroup( 'groupId-2', { parentItemId: 'item-2' } );

		expect( manager.getConfig( {} ) ).toEqual( {
			dimensions: {},
			groupsTree: [
				{
					id: 'groupId-1',
					items: [
						{
							id: 'item-1',
							groups: [],
						},
						{
							id: 'item-2',
							groups: [
								{
									id: 'groupId-2',
									items: [],
									parentItemId: 'item-2',
								},
							],
						},
					],
					parentItemId: '',
				},
			],
		} );
	} );
} );

// npm run test:jest
// npm run test:jest -- -o
