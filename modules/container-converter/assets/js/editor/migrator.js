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
			normalizeSettings: ( settings, { isInner } ) => ( {
				...settings,
				flex_direction: 'row', // Force it to be row.
				// Defaults (since default settings are removed):
				flex_align_items: settings.flex_align_items || 'stretch',
				flex_gap: settings.flex_gap || { size: 10, column: '10', row: '10', unit: 'px' },
				// Inner section overrides:
				...( isInner ? { content_width: 'full' } : {} ),
			} ),
		},
		column: {
			legacyControlsMapping: columnMaps,
			normalizeSettings: ( settings ) => ( {
				...settings,
				content_width: 'full',
			} ),
		},
	};

	/**
	 * Migrate element settings into new settings object, using a map object.
	 *
	 * @param {Object} settings - Settings to migrate.
	 * @param {Object} map      - Mapping object.
	 *
	 * @return {Object} new settings
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
	 * @param {string} elType
	 *
	 * @return {boolean} true, if element can be converted
	 */
	static canConvertToContainer( elType ) {
		return Object.keys( this.config ).includes( elType );
	}

	/**
	 * Get a mapping object of Legacy-to-Container controls mapping.
	 *
	 * @param {Object} model - Element model.
	 *
	 * @return {Object} mapping object
	 */
	static getLegacyControlsMapping( model ) {
		const config = this.config[ model.elType ];

		if ( ! config ) {
			return {};
		}

		const { legacyControlsMapping: mapping } = config;

		return ( 'function' === typeof mapping ) ? mapping( model ) : mapping;
	}

	/**
	 * Normalize element settings (adding defaults, etc.) by elType,
	 *
	 * @param {Object} model    - Element model.
	 * @param {Object} settings - Settings object after migration.
	 *
	 * @return {Object} - normalized settings.
	 */
	static normalizeSettings( model, settings ) {
		const config = this.config[ model.elType ];

		if ( ! config.normalizeSettings ) {
			return settings;
		}

		return config.normalizeSettings( settings, model );
	}
}
