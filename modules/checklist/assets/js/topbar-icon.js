import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@elementor/query';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import RocketIcon from '@elementor/icons/RocketIcon';
import { Infotip } from '@elementor/ui';
import ReminderModal from './components/reminder-modal';
import * as React from 'react';

const fetchStatus = async () => {
	const response = await fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/user-progress`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': elementorWebCliConfig.nonce,
		},
	} );
	const data = await response.json();
	return data.data.first_closed_checklist_in_editor;
};

const queryClient = new QueryClient();

const TopBarIconContent = () => {
	const [ hasRoot, setHasRoot ] = useState( false );
	const [ open, setOpen ] = useState( false );
	const { error, data: closedForFirstTime } = useQuery( {
		queryKey: [ 'closedForFirstTime' ],
		queryFn: fetchStatus,
	} );

	if ( error ) {
		return null;
	}

	useEffect( () => {
		return listenTo( commandEndEvent( 'checklist/toggle-popup' ), ( e ) => {
			setHasRoot( e.args.isOpen );
		} );
	}, [ hasRoot ] );

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
		<Infotip
			placement="bottom-start"
			content={ <ReminderModal setHasRoot={ setHasRoot } setOpen={ setOpen } /> }
			open={ open }
			PopperProps={ {
				modifiers: [
					{
						name: 'offset',
						options:
							{ offset: [ -16, 12 ] },
					},
				],
			} }>
			<RocketIcon />
		</Infotip>
	);
};

const TopBarIcon = () => (
	<QueryClientProvider client={ queryClient }>
		<TopBarIconContent />
	</QueryClientProvider>
);

export default TopBarIcon
