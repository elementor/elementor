import { createContext, useContext, useEffect, useState, useRef } from 'react';

const SettingsContext = createContext( null );

/**
 * @return {{settings: Map, getSettingsGroup: Function, getSetting: Function}|null} context
 */
export const useSettings = () => {
	return useContext( SettingsContext );
};

export const SettingsProvider = ( props ) => {
	const [ status, setStatus ] = useState( 'idle' );
	const [ settings, _setSettings ] = useState( new Map() );
	const settingsRef = useRef( settings );

	const setSettings = ( newSettings ) => {
		settingsRef.current = newSettings;
		_setSettings( newSettings );
	};

	useEffect( () => {
		setStatus( 'loaded' );
	}, [ settings ] );

	const getInitialSettings = () => {
		setStatus( 'loading' );

		window.top.$e.data.get( 'preview/styleguide/settings', {}, { refresh: true } )
			.then( ( newSettings ) => {
				const map = new Map();

				if ( 'object' !== typeof newSettings.data ) {
					return;
				}

				Object.keys( newSettings.data ).forEach( ( group ) => {
					const groupSettings = new Map();

					Object.keys( newSettings.data[ group ] ).forEach( ( key ) => {
						groupSettings.set( key, newSettings.data[ group ][ key ] );
					} );

					map.set( group, groupSettings );
				} );

				setSettings( map );
			} );
	};

	const onCommandEvent = ( event ) => {
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
	};

	const onSettingsChange = ( args ) => {
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
	};

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
		status,
		isReady: 'loaded' === status,
	};

	return <SettingsContext.Provider value={ value } { ...props } />;
};
