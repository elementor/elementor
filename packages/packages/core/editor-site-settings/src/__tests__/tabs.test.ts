import { getSiteSettingsTab, registerSiteSettingsTab } from '../tabs';

describe( 'registerSiteSettingsTab', () => {
	it( 'registers a tab component by id', () => {
		// Arrange.
		const component = () => null;

		// Act.
		registerSiteSettingsTab( { id: 'settings-agents', component } );

		// Assert.
		expect( getSiteSettingsTab( 'settings-agents' )?.component ).toBe( component );
	} );

	it( 'allows a lower priority registration to override an existing tab', () => {
		// Arrange.
		const firstComponent = () => null;
		const secondComponent = () => null;

		registerSiteSettingsTab( { id: 'priority-tab', component: firstComponent, priority: 10 } );
		registerSiteSettingsTab( { id: 'priority-tab', component: secondComponent, priority: 5 } );

		// Assert.
		expect( getSiteSettingsTab( 'priority-tab' )?.component ).toBe( secondComponent );
	} );

	it( 'ignores a higher priority registration when a tab already exists', () => {
		// Arrange.
		const firstComponent = () => null;
		const secondComponent = () => null;

		registerSiteSettingsTab( { id: 'priority-tab-2', component: firstComponent, priority: 10 } );
		registerSiteSettingsTab( { id: 'priority-tab-2', component: secondComponent, priority: 20 } );

		// Assert.
		expect( getSiteSettingsTab( 'priority-tab-2' )?.component ).toBe( firstComponent );
	} );
} );
