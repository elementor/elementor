import ElementsHelper from '../../../../../elements/helper';

export const SectionColumnsSetStructure = () => {
	QUnit.module( 'SectionColumnsSetStructure', () => {
		QUnit.test( 'Move column at same section', ( assert ) => {
			const columns = 3,
				width = 4,
				eSection = ElementsHelper.createSection( 0 ),
				eColumns = [];

			for ( let i = 0; i < columns; i++ ) {
				const eColumn = $e.run( 'document/elements/create', {
					container: eSection,
					model: {
						elType: 'column',
						_column_size: 33,
					},
				} );

				eColumns.push( eColumn );
			}

			ElementsHelper.resizeColumn( eColumns[ 0 ], width );

			ElementsHelper.move( eColumns[ 0 ], eSection, {
				at: columns - 1, // move to end.
			} );

			assert.equal( eColumns[ 0 ].settings.get( '_inline_size' ), width, 'Column size still the same' );
		} );

		QUnit.test( 'Move column at different section', ( assert ) => {
			const columns = 3,
				width = 4,
				eTargetSection = ElementsHelper.createSection( 1 ),
				eSection = ElementsHelper.createSection( 0 ),
				eColumns = [];

			for ( let i = 0; i < columns; i++ ) {
				const eColumn = $e.run( 'document/elements/create', {
					container: eSection,
					model: {
						elType: 'column',
						_column_size: 33,
					},
				} );

				eColumns.push( eColumn );
			}

			ElementsHelper.resizeColumn( eColumns[ 0 ], width );

			ElementsHelper.move( eColumns[ 0 ], eTargetSection );

			// Since move delete it.
			eColumns[ 0 ] = eColumns[ 0 ].lookup();

			assert.equal( eColumns[ 0 ].settings.get( '_inline_size' ), null,
				'Column size cleared' );
		} );
	} );
};

export default SectionColumnsSetStructure;
