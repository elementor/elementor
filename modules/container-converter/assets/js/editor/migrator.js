import sectionMaps from './maps/section';
import columnMaps from './maps/column';

export default class Migrator {
	/**
	 * Migrations configuration by `elType`.
	 *
	 * @type {Object}
	 */
	static config = {
		section: {
			legacyControlsMapping: sectionMaps,
			normalizeSettings: ( settings ) => ( {
				...settings,
				flex_align_items: settings.flex_align_items || 'center',
				flex_direction: 'row', // Force it to be row.
			} ),
		},
		column: {
			legacyControlsMapping: columnMaps,
		},
	};

	/**
	 * Migrate element settings into new settings object, using a map object.
	 *
	 * @param {Object} settings - Settings to migrate.
	 * @param {Object} map - Mapping object.
	 *
	 * @return {Object}
	 */
	static migrate( settings, map ) {
		return Object.fromEntries( Object.entries( { ...settings } ).map( ( [ key, value ] ) => {
			const mapped = map[ key ];

			// Remove setting.
			if ( null === mapped ) {
				return null;
			}

			// Simple key conversion:
			// { old_setting: 'new_setting' }
			if ( 'string' === typeof mapped ) {
				return [ mapped, value ];
			}

			// Advanced conversion using a callback:
			// { old_setting: ( { key, value, settings } ) => [ 'new_setting', value ] }
			if ( 'function' === typeof mapped ) {
				return mapped( { key, value, settings } );
			}

			return [ key, value ];
		} ).filter( Boolean ) );
	}

	/**
	 * Determine if an element can be converted to a Container.
	 *
	 * @param {String} elType
	 *
	 * @return {boolean}
	 */
	static canConvertToContainer( elType ) {
		return Object.keys( this.config ).includes( elType );
	}

	/**
	 * Get a mapping object of Legacy-to-Container controls mapping.
	 *
	 * @return {Object}
	 */
	static getLegacyControlsMapping( elType ) {
		const config = this.config[ elType ];

		if ( ! config ) {
			return {};
		}

		const { legacyControlsMapping: mapping } = config;

		return ( 'function' === typeof mapping ) ? mapping() : mapping;
	}

	/**
	 * Normalize element settings (adding defaults, etc.) by elType,
	 *
	 * @param {string} elType - Element type.
	 * @param {Object} settings - Settings object after migration.
	 *
	 * @return {Object} - normalized settings.
	 */
	static normalizeSettings( elType, settings ) {
		const config = this.config[ elType ];

		if ( ! config.normalizeSettings ) {
			return settings;
		}

		return config.normalizeSettings( settings );
	}
}
