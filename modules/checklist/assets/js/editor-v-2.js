import { Infotip } from '@elementor/ui';
import * as EditorAppBar from '@elementor/editor-app-bar';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import RocketIcon from '@elementor/icons/RocketIcon';
import ReminderModal from './components/reminder-modal';
import { useState, useEffect } from 'react';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

const Icon = () => {
	const [ hasRoot, setHasRoot ] = useState( false );
	const [ closedForFirstTime, setClosedForFirstTime ] = useState( null );
	const [ open, setOpen ] = useState( false );

	const fetchStatus = async () => {
		const response = await fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/user-progress`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': elementorWebCliConfig.nonce,
			},
		} );
		const data = await response.json();
		setClosedForFirstTime( data.data.first_closed_checklist_in_editor );
	};

	useEffect( () => {
		return listenTo( commandEndEvent( 'checklist/toggle-popup' ), ( e ) => {
			if ( e.args.isOpen ) {
				setHasRoot( true );
			} else {
				setHasRoot( false );
			}
		} );
	}, [ hasRoot ] );

	useEffect( () => {
		fetchStatus();
	}, [] );

	useEffect( () => {
		const handleFirstClosed = () => {
			setOpen( true );
		};

		window.addEventListener( 'firstClose', handleFirstClosed );

		return () => {
			window.removeEventListener( 'firstClose', handleFirstClosed );
		};
	}, [] );

	return hasRoot && ! closedForFirstTime ? (
		<RocketIcon />
	) : (
		<Infotip placement="bottom-start" content={ <ReminderModal setHasRoot={ setHasRoot } setOpen={ setOpen } /> } open={ open }
		         PopperProps={ {
					 modifiers: [
						 { name: 'offset',
							 options:
								 { offset: [ -16, 12 ] }
						 }
					]
		} }>
			<RocketIcon />
		</Infotip>
	);
};

export const editorV2 = () => {
	const { utilitiesMenu } = EditorAppBar;

	utilitiesMenu.registerLink( {
		id: 'app-bar-menu-item-checklist',
		priority: 5,
		useProps: () => {
			return {
				title: __( 'Checklist', 'elementor' ),
				icon: () => <Icon />,
				onClick: () => {
					$e.commands.run( 'checklist/toggle-popup' );
				},
			};
		},
	} );
};
