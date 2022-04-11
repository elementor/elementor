/**
 * Create a mock for element Container object.
 *
 * @param args
 * @returns {{}|[]}
 */
const createElement = ( args ) => {
	const { containers = [ args.container ], model = {}, options: { at = 0 } = {} } = args,
		result = [];

	if ( ! containers.some( ( container ) => container ) ) {
		containers[ 0 ] = elementor.getPreviewContainer();
	}

	for ( const container of containers ) {
		const createdContainer = createContainer( {
			type: model.elType,
			...model,
		} );

		container.children.splice( at, 0, createdContainer );
		createdContainer.parent = container;

		if ( 'section' === model.elType ) {
			createElement( {
				container: createdContainer,
				model: {
					elType: 'column',
				},
			} );
		}

		result.push( createdContainer );
	}

	if ( 1 === result.length ) {
		return result[ 0 ];
	}

	return result;
};

/**
 * Create a mock Container object.
 *
 * @param {string} type
 * @param {string} widgetType
 * @param {string} id
 * @param {Object} settings
 * @param {Object[]} children
 * @param {Number} index
 * @param {boolean} isInner
 * @param {Object} args
 *
 * @return {Object}
 */
const createContainer = ( { type, widgetType, id, settings = {}, children = [], index = 0, isInner = false, ...args } ) => {
	const model = {
			elType: type,
			widgetType,
			isInner,
			elements: children,
		},
		container = {
			id,
			type,
			view: { _index: index },
			settings: {
				toJSON: () => ( {
					...settings,
				} ),
			},
			children,
			model: {
				attributes: model,
				get: ( key ) => {
					return model[ key ];
				},
				toJSON: () => model,
			},
			getTitle: () => 'test-title',
			getIcon: () => 'test-icon',
			...args,
		};

	// Attach the current Container as a parent of its children Containers.
	children.forEach( ( child, i ) => {
		child.parent = container;
		child.view._index = i;
	} );

	return container;
};

global.elementor = {
	helpers: {
		scrollToView: jest.fn(),
	},
	navigator: {
		region: {
			$el: {
				find: jest.fn(),
			},
			indicators: {
				customPosition: {
					title: 'Custom Positioning',
					icon: 'cursor-move',
					settingKeys: [
						'_position',
						'_element_width',
					],
					section: '_section_position',
				},
				customCSS: {
					icon: 'code-bold',
					settingKeys: [
						'custom_css',
					],
					title: 'Custom CSS',
					section: 'section_custom_css',
				},
				motionFX: {
					icon: 'flash',
					title: 'Motion Effects',
					settingKeys: [
						'motion_fx_motion_fx_scrolling',
						'motion_fx_motion_fx_mouse',
						'background_motion_fx_motion_fx_scrolling',
						'background_motion_fx_motion_fx_mouse',
					],
					section: 'section_effects',
				},
			},
		},
	},
	getPreviewContainer: () => createContainer( {
		id: 'document',
		type: 'document',
	} ),
};

global.$e = {
	run: jest.fn( ( id, args ) => {
		switch ( id ) {
			case 'document/elements/create':
				return createElement( args );

			// TODO: Add container-converter command after container is merged

			default:
				break;
		}
	} ),
};

global.elementorCommon = {
	config: {
		isRTL: false,
		urls: {
			assets: '../../assets/',
		},
	},
};

global.elementorFrontend = {
	config: {
		responsive: {
			activeBreakpoints: {
				tablet: {},
				mobile: {},
			},
		},
	},
};
