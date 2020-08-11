import ElementsHelper from '../../elements/helper';
import GlobalsHelper from '../helper';
import * as eData from 'elementor-tests-qunit/mock/e-data';

export const Settings = () => {
	QUnit.module( 'Settings', ( hooks ) => {
		hooks.beforeEach( () => {
			$e.data.cache.storage.clear();
		} );

		hooks.before( () => {
			eData.attachCache();
		} );

		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', async ( assert ) => {
				const eButton = ElementsHelper.createAutoButton(),
					id = elementorCommon.helpers.getUniqueId(),
					idSecond = elementorCommon.helpers.getUniqueId(),
					typography_typography = `globals/typography?id=${ id }`, // eslint-disable-line camelcase
					typography_typography_second = `globals/typography?id=${ idSecond }`; // eslint-disable-line camelcase

				$e.data.setCache( $e.components.get( 'globals' ), 'globals/typography', {}, {
					[ id ]: {
						id,
						value: { typography_text_transform: 'uppercase' },
					},
					[ idSecond ]: {
						id,
						value: { typography_text_transform: '' },
					},
				} );

				GlobalsHelper.enable( eButton, { typography_typography } );

				assert.equal( eButton.globals.attributes.typography_typography, typography_typography );

				await GlobalsHelper.settings( eButton, { typography_typography: typography_typography_second } );

				assert.equal( eButton.globals.attributes.typography_typography, typography_typography_second );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', async ( assert ) => {
				const eButtons = ElementsHelper.multiCreateAutoButton(),
					id = elementorCommon.helpers.getUniqueId(),
					idSecond = elementorCommon.helpers.getUniqueId(),
					typography_typography = `globals/typography?id=${ id }`, // eslint-disable-line camelcase
					typography_typography_second = `globals/typography?id=${ idSecond }`; // eslint-disable-line camelcase

				$e.data.setCache( $e.components.get( 'globals' ), 'globals/typography', {}, {
					[ id ]: {
						id,
						value: { typography_text_transform: 'uppercase' },
					},
					[ idSecond ]: {
						id,
						value: { typography_text_transform: '' },
					},
				} );

				GlobalsHelper.multiEnable( eButtons, { typography_typography } );

				eButtons.forEach( ( eButton ) => {
					assert.equal( eButton.globals.attributes.typography_typography, typography_typography );
				} );

				await GlobalsHelper.multiSettings( eButtons, { typography_typography: typography_typography_second } );

				eButtons.forEach( ( eButton ) => {
					assert.equal( eButton.globals.attributes.typography_typography, typography_typography_second );
				} );
			} );
		} );
	} );
};

export default Settings;
