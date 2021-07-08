import ElementsHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/elements/helper';
import GlobalsHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/globals/helper';
import DynamicHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/dynamic/helper';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/container/container.js', () => {
		QUnit.test( 'constructor()', ( assert ) => {
			const fakeArgs = {
					type: 'fake',
					id: 'fake',
					settings: new Backbone.Model(),
					model: new Backbone.Model(),
					label: 'Fake Label',
				},
				container = new elementorModules.editor.Container( fakeArgs );

			assert.equal( !! container, true, );
		} );

		QUnit.test( 'constructor(): without args', ( assert ) => {
			assert.throws(
				() => {
					new elementorModules.editor.Container( {} );
				},
				new Error( 'type is required.' ),
			);
		} );

		QUnit.test( 'getGroupRelatedControls(): Simple', ( assert ) => {
			const excepted = [ 'typography_typography', 'typography_font_family', 'typography_font_size', 'typography_font_size_tablet', 'typography_font_size_mobile', 'typography_font_weight', 'typography_text_transform', 'typography_font_style', 'typography_text_decoration', 'typography_line_height', 'typography_line_height_tablet', 'typography_line_height_mobile', 'typography_letter_spacing', 'typography_letter_spacing_tablet', 'typography_letter_spacing_mobile', 'button_text_color' ],
				settings = {
					typography_typography: '',
					button_text_color: '',
				},
				eButton = ElementsHelper.createAutoButton(),
				controls = eButton.getGroupRelatedControls( settings );

			assert.deepEqual( Object.keys( controls ), excepted );
		} );

		QUnit.test( 'getUtilizedControls(): Simple', ( assert ) => {
			const eButtonSimple = ElementsHelper.createAutoButton(),
				eButtonStyled = ElementsHelper.createAutoButtonStyled();

			assert.deepEqual( eButtonSimple.getUtilizedControls(), {} );
			assert.deepEqual( Object.keys( eButtonStyled.getUtilizedControls() ), [ 'text', 'background_color' ] );
		} );

		QUnit.test( 'getUtilizedControls(): Ensure global control', ( assert ) => {
			// Arrange.
			const eButton = ElementsHelper.createAutoButton(),
				id = elementorCommon.helpers.getUniqueId(),
				background_color = `globals/colors?id=${ id }`; // eslint-disable-line camelcase

			eButton.controls.background_color.global = {};

			$e.data.setCache( $e.components.get( 'globals' ), 'globals/colors', {}, {
				[ id ]: {
					id,
					value: background_color,
				},
			} );

			GlobalsHelper.enable( eButton, { background_color } );

			// Act.
			const controls = eButton.getUtilizedControls();

			// Assert.
			assert.equal( controls.background_color.global.utilized, true );
		} );

		QUnit.test( 'getUtilizedControls(): Ensure dynamic control', ( assert ) => {
			// Arrange.
			const eButton = ElementsHelper.createAutoButton(),
				dynamicTag = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
				dynamicValue = '{ dynamic text }',
				{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( dynamicTag ),
				tag = elementor.dynamicTags.createTag( id, name, settings ),
				key = elementor.dynamicTags.createCacheKey( tag );

			// Set fake data.
			elementor.dynamicTags.cache[ key ] = dynamicValue;

			DynamicHelper.enable( eButton, {
				text: dynamicTag,
			} );

			// Act.
			const controls = eButton.getUtilizedControls();

			// Assert.
			assert.equal( controls.text.dynamic.utilized, true );
		} );

		QUnit.test( 'findChildrenRecursive(): Ensure children found', ( assert ) => {
			// Arrange.
			const eColumn = ElementsHelper.createSection( 1, 1 ),
				eWidgets = [
					ElementsHelper.createButton( eColumn ),
					ElementsHelper.createButton( eColumn ),
				];

			eWidgets.forEach( ( eWidget ) => {
				// Act.
				const foundChildren = elementor.getPreviewContainer().findChildrenRecursive(
					( container ) => container.id === eWidget.id
				);

				// Assert.
				assert.equal( foundChildren, eWidget );
			} );
		} );

		QUnit.test( 'forEachChildrenRecursive(): Ensure works', ( assert ) => {
			// Arrange.
			const eSection = ElementsHelper.createSection( 1 ),
				eColumn = eSection.children[ 0 ],
				eWidgetsIds = [
					ElementsHelper.createButton( eColumn ).id,
					ElementsHelper.createButton( eColumn ).id,
				],
				expectedIds = [ eSection.id, eColumn.id, ... eWidgetsIds ],
				actualIds = [];

			// Act.
			eSection.forEachChildrenRecursive( ( container ) => actualIds.push( container.id ) );

			// Assert.
			assert.deepEqual( actualIds, expectedIds );
		} );

		QUnit.test( 'forSomeChildrenRecursive(): Ensure .some() stops at positive value', ( assert ) => {
			// Arrange.
			const eSection = ElementsHelper.createSection( 1 ),
				eColumn = eSection.children[ 0 ];

			ElementsHelper.createButton( eColumn );
			ElementsHelper.createButton( eColumn );

			let iterationCounter = 0;

			// Act.
			eSection.forSomeChildrenRecursive( ( container ) => {
				if ( container.id === eColumn.id ) {
					return true;
				}
				++iterationCounter;
			} );

			// Assert.
			assert.equal( iterationCounter, 1 );
		} );

		QUnit.test( 'forSomeChildrenRecursive(): Ensure nested', ( assert ) => {
			// Arrange.
			ElementsHelper.createAutoButton();

			const eButtonInSection2 = ElementsHelper.createAutoButton();

			let iterationCounter = 0;

			// Act.
			elementor.getPreviewContainer().forSomeChildrenRecursive( ( container ) => {
				if ( container.id === eButtonInSection2 ) {
					return true;
				}
				++iterationCounter;
			} );

			// Assert.
			assert.equal( iterationCounter, 7 );
		} );
	} );
} );

