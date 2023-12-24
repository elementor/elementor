import { Save } from 'elementor-document/save/commands/internal/save.js';

describe( 'Save', () => {
	let save;
	let settings;
	let container;
	let elementor;

	beforeEach( () => {
		elementor = global.elementor = {};
		elementor.config = {};
		save = new Save();
		settings = {};
		container = {
			settings: {
				defaults: {
					key1: 'value1',
					key2: 'value2',
				},
			},
		};
	} );

	it( 'adds missing persistent settings to payload', () => {
		elementor.config.persistent_keys = [ 'key1', 'key3' ];
		save.addPersistentSettingsToPayload( settings, container );
		expect( settings ).toEqual( {
			key1: 'value1',
		} );
	} );

	it( 'does not modify payload if all persistent settings are present', () => {
		elementor.config.persistent_keys = [ 'key1' ];
		settings.key1 = 'value';
		save.addPersistentSettingsToPayload( settings, container );
		expect( settings ).toEqual( {
			key1: 'value',
		} );
	} );

	it( 'does not add non-persistent settings to payload', () => {
		elementor.config.persistent_keys = [ 'key1', 'key3' ];
		settings.key2 = 'value';
		save.addPersistentSettingsToPayload( settings, container );
		expect( settings ).toEqual( {
			key1: 'value1',
			key2: 'value',
		} );
	} );
} );
