import { useEffect, useState, useMemo } from 'react';
import { addEventListener, AFTER_COMMAND_EVENT } from '../utils/top-events';
import debounce from '../utils/debounce';

export default function useSettings( props ) {
	const STATE_LOADING = 'loading';
	const STATE_READY = 'ready';
	const STATE_ERROR = 'error';

	const [ state, setState ] = useState( STATE_LOADING );
	const [ settings, setSettings ] = useState( {} );

	const getSettings = () => {
		window.top.$e.data.get( 'preview/styleguide/settings', {}, { refresh: true } )
			.then( ( newSettings ) => {
				setSettings( newSettings.data );
			} );
	};

	// TODO: Make nicer code and add useMemo
	useEffect( () => {
		if ( ! Object.keys( settings ).length ) {
			return;
		}

		setState( STATE_READY );
	}, [ settings ] );

	const onSettingsChange = debounce( ( event ) => {
		const command = 'document/elements/settings';

		if ( event.detail.command !== command ) {
			return;
		}

		const args = event.detail.args;

		const name = args.container.model.attributes.name;
		if ( ! settings[ name ] ) {
			return;
		}

		setSettings( ( settings ) => {
			const newSettings = { ...settings };

			newSettings[ name ] = newSettings[ name ].map( ( item ) => {
				if ( item._id === args.container.id ) {
					return { ...item, ...args.settings };
				}

				return item;
			} );

			return newSettings;
		} );
	} );

	const onInsert = ( event ) => {
		const command = 'document/repeater/insert';

		if ( event.detail.command !== command ) {
			return;
		}

		const args = event.detail.args;

		const name = args.name;
		if ( ! settings[ name ] ) {
			return;
		}

		setSettings( ( settings ) => {
			const newSettings = { ...settings };

			const newFieldArray = [ ...newSettings[ name ] ];

			const at = undefined === args.options?.at ? newFieldArray.length : args.options.at;

			newSettings[ name ] = [ ...newFieldArray.slice( 0, at ), args.model, ...newFieldArray.slice( at ) ];
			return newSettings;
		} );
	};

	const onRemove = ( event ) => {
		const command = 'document/repeater/remove';

		if ( event.detail.command !== command ) {
			return;
		}

		const args = event.detail.args;

		const name = args.name;
		if ( ! settings[ name ] ) {
			return;
		}

		setSettings( ( settings ) => {
			const newSettings = { ...settings };
			const newFieldArray = [ ...newSettings[ name ] ];
			newSettings[ name ] = newFieldArray.filter( ( item, index ) => index !== args.index );
			return newSettings;
		} );
	};

	useEffect( () => {
		getSettings();

		addEventListener( AFTER_COMMAND_EVENT, onSettingsChange );
		addEventListener( AFTER_COMMAND_EVENT, onInsert );
		addEventListener( AFTER_COMMAND_EVENT, onRemove );

		return () => {
			addEventListener( AFTER_COMMAND_EVENT, onSettingsChange );
			addEventListener( AFTER_COMMAND_EVENT, onInsert );
			addEventListener( AFTER_COMMAND_EVENT, onRemove );
		};
	}, [] );

	return {
		isLoading: STATE_LOADING === state,
		settings,
	};
}
