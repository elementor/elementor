import React, { useEffect, useState } from 'react';
import listenToCommand from "../../../../../assets/js/common/utils/listen-to-command";

const useSiteSettings = ( initial ) => {
	const [ settings, setSettings ] = useState( initial );

	useEffect( () => {
		listenToCommand( 'document/elements/settings', ( args ) => {
			let name = args.container.model.attributes.name;
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

		listenToCommand( 'document/repeater/insert', ( args ) => {
			let name = args.name;
			if ( ! settings[ name ] ) {
				return;
			}

			setSettings( ( settings ) => {
				const newSettings = { ...settings };

				newSettings[ name ] = [ ...newSettings[ name ], args.model ];
				return newSettings;
			} );
		} , false);

		listenToCommand( 'document/repeater/remove', ( args ) => {
			let name = args.name;
			if ( ! settings[ name ] ) {
				return;
			}

			setSettings( ( settings ) => {
				const newSettings = { ...settings };
				newSettings[ name ] = newSettings[ name ].filter( ( item, index ) => index !== args.index );
				return newSettings;
			} );
		} , false);
	}, [] );

	const setActive = ( id, source ) => {
		setSettings( ( settings ) => {
			const newSettings = { ...settings };

			Object.getOwnPropertyNames( newSettings ).forEach( ( setting ) => {
				newSettings[ setting ] = newSettings[ setting ].map( ( item ) => {
					item.isActive = setting.includes( source ) && item._id === id;
					return item;
				} );
			} );

			return newSettings;
		} );
	};

	return {
		settings,
		setActive,
	}

};

export default useSiteSettings;