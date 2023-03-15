import Module from 'elementor/modules/dev-tools/assets/js/module';

describe( 'modules/dev-tools/assets/js/module.js', () => {
	beforeEach( () => {
		global.elementorDevToolsConfig = {
			deprecation: {
				soft_notices: {
					'elementor/old/hook': [
						'3.5.0',
						'elementor/new/hook',
					],
					'elementor/old/hook2': [
						'3.6.0',
						'elementor/new/hook2',
					],
				},
			},
		};
	} );

	it( 'Should print soft deprecation', () => {
		// Arrange.
		const deprecationMock = new class {
			deprecated = jest.fn();
		};

		const devToolsModule = new Module( deprecationMock );

		// Act.
		devToolsModule.notifyBackendDeprecations();

		// Assert.
		expect( deprecationMock.deprecated ).toBeCalledTimes( 2 );
		expect( deprecationMock.deprecated ).toBeCalledWith( 'elementor/old/hook', '3.5.0', 'elementor/new/hook' );
		expect( deprecationMock.deprecated ).toBeCalledWith( 'elementor/old/hook2', '3.6.0', 'elementor/new/hook2' );
	} );
} );
