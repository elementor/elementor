import * as React from 'react';

const DELIMITER = '/';

type InteractionDetailsProps = {
	interaction: string;
	onChange: ( interaction: string ) => void;
};

export const InteractionDetails = ( { interaction, onChange }: InteractionDetailsProps ) => {
	const [ interactionDetails ] = React.useState( () => {
		const [ trigger, effect, type, direction, duration, delay ] = interaction.split( DELIMITER );

		return {
			trigger: trigger || 'page-load',
			effect: effect || 'fade',
			type: type || 'in',
			direction: direction || '',
			duration: duration || '300',
			delay: delay || '0',
		};
	} );

	React.useEffect( () => {
		const newValue = Object.values( interactionDetails ).join( DELIMITER );
		onChange( newValue );
	}, [ interactionDetails, onChange ] );

	return <></>;
};
