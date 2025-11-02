import * as React from 'react';
import { Divider, Grid } from '@elementor/ui';

import { Delay, Direction, Duration, Effect, EffectType, Trigger } from './interaction-details-fields';

const DELIMITER = '/';

type InteractionDetailsProps = {
	interaction: string;
	onChange: ( interaction: string ) => void;
};

export const InteractionDetails = ( { interaction, onChange }: InteractionDetailsProps ) => {
	const [ interactionDetails, setInteractionDetails ] = React.useState( () => {
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

	const onSelectTrigger = ( trigger: string ) => {
		setInteractionDetails( ( prev ) => {
			return { ...prev, trigger };
		} );
	};

	const onSelectEffect = ( effect: string ) => {
		setInteractionDetails( ( prev ) => {
			return { ...prev, effect };
		} );
	};

	const onSelectEffectType = ( type: string ) => {
		setInteractionDetails( ( prev ) => {
			return { ...prev, type };
		} );
	};

	const onSelectDirection = ( direction: string ) => {
		setInteractionDetails( ( prev ) => {
			return { ...prev, direction };
		} );
	};

	const onSelectDuration = ( duration: string ) => {
		setInteractionDetails( ( prev ) => {
			return { ...prev, duration };
		} );
	};

	const onSelectDelay = ( delay: string ) => {
		setInteractionDetails( ( prev ) => {
			return { ...prev, delay };
		} );
	};

	return (
		<>
			<Grid container spacing={ 2 } sx={ { width: '300px', p: 1 } }>
				<Trigger value={ interactionDetails.trigger } onChange={ onSelectTrigger } />
			</Grid>
			<Divider />
			<Grid container spacing={ 2 } sx={ { width: '300px', p: 1 } }>
				<Effect value={ interactionDetails.effect } onChange={ onSelectEffect } />
				<EffectType value={ interactionDetails.type } onChange={ onSelectEffectType } />
				<Direction value={ interactionDetails.direction ?? '' } onChange={ onSelectDirection } />
				<Duration value={ interactionDetails.duration } onChange={ onSelectDuration } />
				<Delay value={ interactionDetails.delay } onChange={ onSelectDelay } />
			</Grid>
		</>
	);
};
