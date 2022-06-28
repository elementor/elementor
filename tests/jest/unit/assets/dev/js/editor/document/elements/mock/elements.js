export const containersMock = [
	{
		id: 'container-1',
		type: 'container',
		children: [
			{
				id: 'widget-1',
				type: 'widget',
				children: [],
			},
			{
				id: 'widget-2',
				type: 'widget',
				children: [],
			},
		],
	},
	{
		id: 'container-2',
		type: 'container',
		children: [],
	},
];

export function mockElements() {
	global.elementor.elementsModel = {
		get: () => containersMock,
	};

	global.elementor.getContainer = ( id ) => {
		const findContainer = ( containerId, root ) => {
			for ( const container of root ) {
				if ( container.id === containerId ) {
					return container;
				}

				const childContainer = findContainer( containerId, container.children );

				if ( childContainer ) {
					return childContainer;
				}
			}

			return null;
		};

		return findContainer( id, containersMock );
	};
}
