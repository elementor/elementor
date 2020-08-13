import ElementsHelper from 'elementor-tests-qunit/assets/dev/js/editor/document/elements/helper';

export const Expand = () => {
	QUnit.module( 'Expand', () => {
		QUnit.test( 'Simple', ( assert ) => {
			const eWidget = ElementsHelper.createAutoButton(),
				eColumn = eWidget.parent,
				eSection = eColumn.parent;

			// Collapse all.
			$e.run( 'navigator/elements/toggle-folding-all', { state: false } );

			[ eSection, eColumn, eWidget ].forEach( ( container ) => {
				$e.run( 'navigator/elements/expand', { container } );

				assert.equal( container.navView.$el.children().hasClass( 'elementor-active' ), true );
			} );
		} );
	} );
};

export default Expand;
