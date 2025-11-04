import * as React from 'react';
import { useEffect, useState } from 'react';
import { Divider, Grid } from '@elementor/ui';

import { Delay } from './controls/delay';
import { Direction } from './controls/direction';
import { Duration } from './controls/duration';
import { Effect } from './controls/effect';
import { EffectType } from './controls/effect-type';
import { Trigger } from './controls/trigger';

const DELIMITER = '-';

type InteractionDetailsProps = {
	interaction: string;
	onChange: ( interaction: string ) => void;
};

export const InteractionDetails = ( { interaction, onChange }: InteractionDetailsProps ) => {
	const [ interactionDetails, setInteractionDetails ] = useState( () => {
		const [ trigger, effect, type, direction, duration, delay ] = interaction.split( DELIMITER );

		return {
			trigger: trigger || 'load',
			effect: effect || 'fade',
			type: type || 'in',
			direction: direction || '',
			duration: duration || '300',
			delay: delay || '0',
		};
	} );

	useEffect( () => {
		const newValue = Object.values( interactionDetails ).join( DELIMITER );
		onChange( newValue );
	}, [ interactionDetails, onChange ] );

	const handleChange = < K extends keyof typeof interactionDetails >(
		key: K,
		value: ( typeof interactionDetails )[ K ]
	) => {
		setInteractionDetails( ( prev ) => ( { ...prev, [ key ]: value } ) );
	};

	return (
		<>
			<Grid container spacing={ 2 } sx={ { width: '300px', p: 1 } }>
				<Trigger value={ interactionDetails.trigger } onChange={ ( v ) => handleChange( 'trigger', v ) } />
			</Grid>
			<Divider />
			<Grid container spacing={ 2 } sx={ { width: '300px', p: 1 } }>
				<Effect value={ interactionDetails.effect } onChange={ ( v ) => handleChange( 'effect', v ) } />
				<EffectType value={ interactionDetails.type } onChange={ ( v ) => handleChange( 'type', v ) } />
				<Direction
					value={ interactionDetails.direction ?? '' }
					onChange={ ( v ) => handleChange( 'direction', v ) }
				/>
				<Duration value={ interactionDetails.duration } onChange={ ( v ) => handleChange( 'duration', v ) } />
				<Delay value={ interactionDetails.delay } onChange={ ( v ) => handleChange( 'delay', v ) } />
			</Grid>
		</>
	);
};
