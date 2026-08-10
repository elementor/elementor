import { getElementChildren } from './get-element-children';

const DUPLICATE_BEHAVIOR_META_KEY = 'duplicate_behavior';
const DUPLICATE_BEHAVIOR_CLEAR = 'clear';

function getClearablePropKeys( model ) {
	const schema = elementor.helpers.getWidgetCache( model )?.atomic_props_schema ?? {};

	return Object.entries( schema )
		.filter( ( [ , prop ] ) => DUPLICATE_BEHAVIOR_CLEAR === prop?.meta?.[ DUPLICATE_BEHAVIOR_META_KEY ] )
		.map( ( [ key ] ) => key );
}

function getSettingsJson( model ) {
	const container = elementor.getContainer( model.get( 'id' ) );

	if ( container ) {
		return container.settings?.toJSON?.() ?? {};
	}

	return model.get( 'settings' )?.toJSON?.() ?? {};
}

function toClearedValue( currentValue ) {
	if ( currentValue && 'object' === typeof currentValue && '$$type' in currentValue ) {
		return { ...currentValue, value: null };
	}

	return null;
}

function updateSettings( model, settings ) {
	const container = elementor.getContainer( model.get( 'id' ) );

	if ( container ) {
		$e.internal( 'document/elements/set-settings', { container, settings } );
		return;
	}

	model.get( 'settings' )?.set( settings );
}

function clearSettingsForModel( model ) {
	const clearableKeys = getClearablePropKeys( model );

	if ( ! clearableKeys.length ) {
		return;
	}

	const settingsJson = getSettingsJson( model );

	const settingsToClear = clearableKeys.reduce( ( acc, key ) => {
		if ( settingsJson[ key ]?.value ) {
			acc[ key ] = toClearedValue( settingsJson[ key ] );
		}

		return acc;
	}, {} );

	if ( Object.keys( settingsToClear ).length ) {
		updateSettings( model, settingsToClear );
	}
}

export function clearDuplicatedSettings( container ) {
	if ( ! container?.model ) {
		return;
	}

	getElementChildren( container.model ).forEach( clearSettingsForModel );
}
