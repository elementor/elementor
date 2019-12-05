import ElementsHelper from '../../../elements/helper';

export const SetStructure = () => {
	QUnit.module( 'SetStructure', () => {
		QUnit.test( 'apply(): Inner Section', ( assert ) => {
			const structure = '21',
				eInnerSection = ElementsHelper.createInnerSection(
					ElementsHelper.createSection( 1, true )
				);

			ElementsHelper.settings( eInnerSection, { structure } );

			const done = assert.async();

			setTimeout( () => {
				assert.equal( eInnerSection.settings.get( 'structure' ), structure,
					'structure was set correctly' );
				done();
			} );
		} );

		// TODO: Create another test which check the view.
	} );
};

export default SetStructure;
