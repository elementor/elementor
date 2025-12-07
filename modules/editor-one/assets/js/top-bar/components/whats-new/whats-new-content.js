import { useEffect, useState } from '@wordpress/element';
import { LinearProgress, Typography } from '@elementor/ui';
import WhatsNewItem from './whats-new-item';
import { ContentContainer, LoadingContainer } from './styled-components';

const WhatsNewContent = () => {
	const [ items, setItems ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		elementorCommon.ajax.addRequest(
			'notifications_get',
			{
				success: ( data ) => {
					setItems( data );
					setIsLoading( false );
				},
				error: ( err ) => {
					setError( err );
					setIsLoading( false );
				},
			},
		);
	}, [] );

	if ( isLoading ) {
		return (
			<LoadingContainer>
				<LinearProgress color="secondary" />
			</LoadingContainer>
		);
	}

	if ( error ) {
		return (
			<ContentContainer>
				<Typography color="error">
					{ __( 'Failed to load notifications', 'elementor' ) }
				</Typography>
			</ContentContainer>
		);
	}

	if ( ! items || items.length === 0 ) {
		return (
			<ContentContainer>
				<Typography color="text.secondary">
					{ __( 'No new updates', 'elementor' ) }
				</Typography>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			{ items.map( ( item, index ) => (
				<WhatsNewItem
					key={ index }
					item={ item }
					isLast={ index === items.length - 1 }
				/>
			) ) }
		</ContentContainer>
	);
};

export default WhatsNewContent;

