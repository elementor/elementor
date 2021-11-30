import ElementsHelper from 'elementor-tests-qunit/tests/assets/dev/js/editor/document/elements/helper';

export const Collapse = () => {
	QUnit.module( 'Collapse', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			// Arrange.
			const eWidget = ElementsHelper.createAutoButton(),
				eColumn = eWidget.parent,
				eSection = eColumn.parent,
				all = [ eSection, eColumn, eWidget ];

			$e.run( 'navigator/elements/toggle-folding-all', { state: true } );

			// Act.
			all.forEach( ( container ) => {
				$e.run( 'navigator/elements/collapse', { container } );
			} );

			// Filter all non active.
			const actual = all.filter( ( container ) => ! elementor.navigator.elements.getElementView( container.id ).$el.children().hasClass( 'elementor-active' ) );

			// Assert.
			assert.equal( actual.length, all.length );
		} );
	} );
};

export default Collapse;
