import ElementsHelper from 'elementor-tests-qunit/tests/assets/dev/js/editor/document/elements/helper';

export const Expand = () => {
	QUnit.module( 'Expand', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			// Arrange.
			const eWidget = ElementsHelper.createAutoButton(),
				eColumn = eWidget.parent,
				eSection = eColumn.parent,
				all = [ eSection, eColumn, eWidget ];

			assert.expect( all.length );

			$e.run( 'navigator/elements/toggle-folding-all', { state: true } );

			all.forEach( ( container ) => {
				// Act.
				$e.run( 'navigator/elements/expand', { container } );

				// Assert.
				assert.equal(
					elementor.navigator.elements.getElementView( container.id ).$el.children().hasClass( 'elementor-active' ),
					true
				);
			} );
		} );
	} );
};

export default Expand;
