import ElementsHelper from '../../elements/helper';
import GlobalsHelper from '../helper';
import * as eData from 'elementor/tests/qunit/mock/e-data';

export const Disable = () => {
	QUnit.module( 'Disable', ( hooks ) => {
		hooks.beforeEach( () => {
			$e.data.cache.storage.clear();
		} );

		hooks.before( () => {
			eData.attachCache();
		} );

		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButton = ElementsHelper.createAutoButton(),
					id = elementorCommon.helpers.getUniqueId(),
					typography_typography = `globals/typography?id=${ id }`; // eslint-disable-line camelcase

				$e.data.setCache( $e.components.get( 'globals' ), 'globals/typography', {}, {
					[ id ]: {
						id,
						value: { typography_text_transform: 'uppercase' },
					},
				} );

				GlobalsHelper.enable( eButton, { typography_typography } );

				assert.equal( eButton.globals.attributes.typography_typography, typography_typography );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtons = ElementsHelper.multiCreateAutoButton(),
					id = elementorCommon.helpers.getUniqueId(),
					typography_typography = `globals/typography?id=${ id }`; // eslint-disable-line camelcase

				$e.data.setCache( $e.components.get( 'globals' ), 'globals/typography', {}, {
					[ id ]: {
						id,
						value: { typography_text_transform: 'uppercase' },
					},
				} );

				GlobalsHelper.multiEnable( eButtons, { typography_typography } );

				eButtons.forEach( ( eButton ) => {
					assert.equal( eButton.globals.attributes.typography_typography, typography_typography );
				} );
			} );
		} );
	} );
};

export default Disable;
