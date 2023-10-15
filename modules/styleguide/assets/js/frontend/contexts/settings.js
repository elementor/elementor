import { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import useDebouncedCallback from '../hooks/use-debounced-callback';

const SettingsContext = createContext( null );

/**
 * @return {{settings: Map, isReady: boolean}|null} context
 */
export const useSettings = () => {
	return useContext( SettingsContext );
};

export const SettingsProvider = ( props ) => {
	const [ status, setStatus ] = useState( 'idle' );
	const [ settings, _setSettings ] = useState( new Map() );
	const settingsRef = useRef( settings );

	// TODO: Use `useDebouncedCallback` instead of `useCallback`.
	const setSettings = ( newSettings ) => {
		settingsRef.current = newSettings;
		_setSettings( newSettings );
	};

	useEffect( () => {
		setStatus( 'loaded' );
	}, [ settings ] );

	const getInitialSettings = () => {
		setStatus( 'loading' );

		const kitSettings = elementor.documents.getCurrent().config.settings.settings;

		var map = new Map( [
			[ 'colors', new Map( [
				[ 'system_colors', kitSettings.system_colors ],
				[ 'custom_colors', kitSettings.custom_colors ],
			] ) ],
			[ 'fonts', new Map( [
				[ 'system_typography', kitSettings.system_typography ],
				[ 'custom_typography', kitSettings.custom_typography ],
				[ 'fallback_font', kitSettings.default_generic_fonts ],
			] ) ],
			[ 'config', new Map( [
				[ 'is_debug', elementorCommon.config.isElementorDebug ],
			] ) ],
		] );

		setSettings( map );
	};

	const onCommandEvent = useCallback( ( event ) => {
		switch ( event.detail.command ) {
			case 'document/elements/settings':
				onSettingsChange( event.detail.args );
				break;
			case 'document/repeater/insert':
				onInsert( event.detail.args );
				break;
			case 'document/repeater/remove':
				onRemove( event.detail.args );
				break;
			default:
				break;
		}
	}, [] );

	/**
	 * Triggered when a color or font is changed.
	 * Has a 100ms debounce.
	 *
	 * @param {{container: {model: {attributes: {name: string}}, id: number}, settings: {}}} args
	 */
	const onSettingsChange = useDebouncedCallback( ( args ) => {
		const name = args.container.model.attributes.name;

		const newSettings = new Map( settingsRef.current );

		for ( const [ group, groupSettings ] of newSettings.entries() ) {
			if ( ! groupSettings.has( name ) ) {
				continue;
			}

			if ( Array.isArray( groupSettings.get( name ) ) ) {
				const index = groupSettings.get( name ).findIndex( ( item ) => item._id === args.container.id );

				if ( -1 === index ) {
					return;
				}

				newSettings.get( group ).get( name )[ index ] = { ...groupSettings.get( name )[ index ], ...args.settings };
			} else {
				newSettings.get( group ).set( name, args.settings );
			}
		}

		setSettings( newSettings );
	}, 100 );

	/**
	 * Triggered when a new custom color or font is created.
	 *
	 * @param {{name: string, model: string, options: {at: number}}} args
	 */
	const onInsert = ( args ) => {
		const name = args.name;

		const newSettings = new Map( settingsRef.current );

		for ( const [ group, groupSettings ] of newSettings.entries() ) {
			if ( ! groupSettings.has( name ) ) {
				continue;
			}

			const newArray = [ ...groupSettings.get( name ) ];

			const at = ( undefined === args.options?.at )
				? newArray.length
				: args.options.at;

			newSettings.get( group ).set( name, [ ...newArray.slice( 0, at ), args.model, ...newArray.slice( at ) ] );
		}

		setSettings( newSettings );
	};

	/**
	 * Triggered when a custom color or font is removed.
	 *
	 * @param {{name: string, index: number}} args
	 */
	const onRemove = ( args ) => {
		const name = args.name;

		const newSettings = new Map( settingsRef.current );

		for ( const [ group, groupSettings ] of newSettings.entries() ) {
			if ( ! groupSettings.has( name ) ) {
				continue;
			}

			const newArray = [ ...groupSettings.get( name ) ];

			newSettings.get( group ).set( name, newArray.filter( ( item, index ) => index !== args.index ) );
		}

		setSettings( newSettings );
	};

	useEffect( () => {
		getInitialSettings();

		window.top.addEventListener( 'elementor/commands/run/after', onCommandEvent, { passive: true } );

		return () => {
			window.top.removeEventListener( 'elementor/commands/run/after', onCommandEvent );
		};
	}, [] );

	const value = {
		settings,
		isReady: 'loaded' === status,
	};

	return <SettingsContext.Provider value={ value } { ...props } />;
};
