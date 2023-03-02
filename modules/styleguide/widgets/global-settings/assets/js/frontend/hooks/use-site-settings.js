import React, { useEffect, useState } from 'react';
import { addEventListener, AFTER_COMMAND_EVENT, } from "../../../../../assets/js/common/utils/top-events";
import debounce from "../../../../../assets/js/common/utils/debounce";

const useSiteSettings = ( initial ) => {
	const [ settings, setSettings ] = useState( initial );

	useEffect( () => {
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
		settings,
	};

};

export default useSiteSettings;