import { getKitTab, registerKitTab } from '../tabs';

describe( 'registerKitTab', () => {
	it( 'registers a tab component by id', () => {
		// Arrange.
		const component = () => null;

		// Act.
		registerKitTab( { id: 'settings-agents', component } );

		// Assert.
		expect( getKitTab( 'settings-agents' )?.component ).toBe( component );
	} );

	it( 'allows a lower priority registration to override an existing tab', () => {
		// Arrange.
		const firstComponent = () => null;
		const secondComponent = () => null;

		registerKitTab( { id: 'priority-tab', component: firstComponent, priority: 10 } );
		registerKitTab( { id: 'priority-tab', component: secondComponent, priority: 5 } );

		// Assert.
		expect( getKitTab( 'priority-tab' )?.component ).toBe( secondComponent );
	} );

	it( 'ignores a higher priority registration when a tab already exists', () => {
		// Arrange.
		const firstComponent = () => null;
		const secondComponent = () => null;

		registerKitTab( { id: 'priority-tab-2', component: firstComponent, priority: 10 } );
		registerKitTab( { id: 'priority-tab-2', component: secondComponent, priority: 20 } );

		// Assert.
		expect( getKitTab( 'priority-tab-2' )?.component ).toBe( firstComponent );
	} );
} );
