import ElementsHelper from 'elementor-tests-qunit/assets/dev/js/editor/document/elements/helper';

export const Collapse = () => {
	QUnit.module( 'Collapse', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			const eWidget = ElementsHelper.createAutoButton(),
				eColumn = eWidget.parent,
				eSection = eColumn.parent,
				all = [ eSection, eColumn, eWidget ];

			// TODO: Timeout & promising because of 'container.navView'.
			setTimeout( () => {
				// Expand all
				$e.run( 'navigator/elements/toggle-folding-all', { state: true } );
			} );

			assert.expect( all.length );

			const promises = all.map( ( container ) => new Promise( ( resolve ) => {
				setTimeout( () => {
					$e.run( 'navigator/elements/collapse', { container } );

					assert.equal( container.navView.$el.children().hasClass( 'elementor-active' ), false);

					resolve();
				} );
			} ) );

			await Promise.all( promises );
		} );
	} );
};

export default Collapse;
