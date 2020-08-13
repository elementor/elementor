import ElementsHelper from 'elementor-tests-qunit/assets/dev/js/editor/document/elements/helper';

export const Collapse = () => {
	QUnit.module( 'Collapse', () => {
		QUnit.test( 'Simple', ( assert ) => {
			const eWidget = ElementsHelper.createAutoButton(),
				eColumn = eWidget.parent,
				eSection = eColumn.parent;

			// Collapse all.
			$e.run( 'navigator/elements/toggle-folding-all', { state: true } );

			[ eSection, eColumn, eWidget ].forEach( ( container ) => {
				$e.run( 'navigator/elements/collapse', { container } );

				assert.equal( container.navView.$el.children().hasClass( 'elementor-active' ), false );
			} );
		} );
	} );
};

export default Collapse;
