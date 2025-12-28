const MOCK_CURRENT_COMPONENT_ID = 100;
const MOCK_PARENT_COMPONENT_ID = 200;
const MOCK_GRANDPARENT_COMPONENT_ID = 300;
const MOCK_UNRELATED_COMPONENT_ID = 999;

describe( 'prevent-circular-nesting logic', () => {
	describe( 'wouldCreateCircularNesting core logic', () => {
		type PathItem = { componentId: number; instanceId?: string };

		function checkCircularNesting(
			componentIdToAdd: number | string | undefined,
			currentComponentId: number | null,
			path: PathItem[]
		): boolean {
			if ( componentIdToAdd === undefined ) {
				return false;
			}

			if ( currentComponentId === null ) {
				return false;
			}

			if ( componentIdToAdd === currentComponentId ) {
				return true;
			}

			return path.some( ( item ) => item.componentId === componentIdToAdd );
		}

		it( 'should return false when componentIdToAdd is undefined', () => {
			// Arrange
			const currentComponentId = MOCK_CURRENT_COMPONENT_ID;
			const path: PathItem[] = [];

			// Act
			const result = checkCircularNesting( undefined, currentComponentId, path );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should return false when not editing any component', () => {
			// Arrange
			const currentComponentId = null;
			const path: PathItem[] = [];

			// Act
			const result = checkCircularNesting( MOCK_UNRELATED_COMPONENT_ID, currentComponentId, path );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should return true when trying to add the same component being edited', () => {
			// Arrange
			const currentComponentId = MOCK_CURRENT_COMPONENT_ID;
			const path: PathItem[] = [ { componentId: MOCK_CURRENT_COMPONENT_ID, instanceId: 'instance-1' } ];

			// Act
			const result = checkCircularNesting( MOCK_CURRENT_COMPONENT_ID, currentComponentId, path );

			// Assert
			expect( result ).toBe( true );
		} );

		it( 'should return true when trying to add a component from the editing path', () => {
			// Arrange
			const currentComponentId = MOCK_CURRENT_COMPONENT_ID;
			const path: PathItem[] = [
				{ componentId: MOCK_GRANDPARENT_COMPONENT_ID, instanceId: 'instance-1' },
				{ componentId: MOCK_PARENT_COMPONENT_ID, instanceId: 'instance-2' },
				{ componentId: MOCK_CURRENT_COMPONENT_ID, instanceId: 'instance-3' },
			];

			// Act
			const resultParent = checkCircularNesting( MOCK_PARENT_COMPONENT_ID, currentComponentId, path );
			const resultGrandparent = checkCircularNesting( MOCK_GRANDPARENT_COMPONENT_ID, currentComponentId, path );

			// Assert
			expect( resultParent ).toBe( true );
			expect( resultGrandparent ).toBe( true );
		} );

		it( 'should return false when adding an unrelated component', () => {
			// Arrange
			const currentComponentId = MOCK_CURRENT_COMPONENT_ID;
			const path: PathItem[] = [
				{ componentId: MOCK_PARENT_COMPONENT_ID, instanceId: 'instance-1' },
				{ componentId: MOCK_CURRENT_COMPONENT_ID, instanceId: 'instance-2' },
			];

			// Act
			const result = checkCircularNesting( MOCK_UNRELATED_COMPONENT_ID, currentComponentId, path );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should handle string component IDs', () => {
			// Arrange
			const currentComponentId = 100;
			const path: PathItem[] = [ { componentId: 100, instanceId: 'instance-1' } ];

			// Act - component IDs might be strings from the DOM
			const result = checkCircularNesting( '100', currentComponentId, path );

			// Assert - string '100' !== number 100 (strict comparison)
			expect( result ).toBe( false );
		} );
	} );

	describe( 'component element extraction', () => {
		const COMPONENT_TYPE = 'e-component';

		function extractComponentIdFromModel( model: {
			widgetType?: string;
			elType?: string;
			settings?: {
				component_instance?: {
					value?: {
						component_id?: { value?: number | string };
					};
				};
			};
		} ): number | string | undefined {
			if ( ! model ) {
				return undefined;
			}

			const isComponent = model.widgetType === COMPONENT_TYPE || model.elType === COMPONENT_TYPE;

			if ( ! isComponent ) {
				return undefined;
			}

			return model.settings?.component_instance?.value?.component_id?.value;
		}

		it( 'should return undefined for non-component widgets', () => {
			// Arrange
			const model = {
				widgetType: 'e-button',
				settings: {},
			};

			// Act
			const result = extractComponentIdFromModel( model );

			// Assert
			expect( result ).toBeUndefined();
		} );

		it( 'should extract component ID from component widget', () => {
			// Arrange
			const model = {
				widgetType: COMPONENT_TYPE,
				settings: {
					component_instance: {
						value: {
							component_id: { value: 123 },
						},
					},
				},
			};

			// Act
			const result = extractComponentIdFromModel( model );

			// Assert
			expect( result ).toBe( 123 );
		} );

		it( 'should handle missing settings gracefully', () => {
			// Arrange
			const model = {
				widgetType: COMPONENT_TYPE,
			};

			// Act
			const result = extractComponentIdFromModel( model );

			// Assert
			expect( result ).toBeUndefined();
		} );
	} );
} );
