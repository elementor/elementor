import * as React from 'react';
import { useEffect, useState } from 'react';
import { Divider, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { Direction } from './controls/direction';
import { Effect } from './controls/effect';
import { EffectType } from './controls/effect-type';
import { TimeFrameIndicator } from './controls/time-frame-indicator';
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
	}, [ interactionDetails ] );

	const handleChange = < K extends keyof typeof interactionDetails >(
		key: K,
		value: ( typeof interactionDetails )[ K ]
	) => {
		setInteractionDetails( ( prev ) => ( { ...prev, [ key ]: value } ) );
	};

	return (
		<>
			<Grid container spacing={ 2 } sx={ { p: 1.5 } }>
				<Trigger value={ interactionDetails.trigger } onChange={ ( v ) => handleChange( 'trigger', v ) } />
			</Grid>
			<Divider sx={ { mx: 1.5 } } />
			<Grid container spacing={ 2 } sx={ { p: 1.5 } }>
				<Effect value={ interactionDetails.effect } onChange={ ( v ) => handleChange( 'effect', v ) } />
				<EffectType value={ interactionDetails.type } onChange={ ( v ) => handleChange( 'type', v ) } />
				<Direction
					value={ interactionDetails.direction ?? '' }
					onChange={ ( v ) => handleChange( 'direction', v ) }
				/>
				<TimeFrameIndicator
					value={ interactionDetails.duration }
					onChange={ ( v ) => handleChange( 'duration', v ) }
					label={ __( 'Duration', 'elementor' ) }
				/>
				<TimeFrameIndicator
					value={ interactionDetails.delay }
					onChange={ ( v ) => handleChange( 'delay', v ) }
					label={ __( 'Delay', 'elementor' ) }
				/>
			</Grid>
		</>
	);
};
