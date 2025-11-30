import * as React from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { Divider, Grid } from '@elementor/ui';
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
export const DEFAULT_INTERACTION = 'load-fade-in--300-0';

const getDefaultInteractionDetails = () => {
	const [ trigger, effect, type, direction, duration, delay ] = DEFAULT_INTERACTION.split( DELIMITER );

	return {
		trigger,
		effect,
		type,
		direction,
		duration,
		delay,
	};
};

const buildInteractionDetails = ( interaction: string ) => {
	const [ trigger, effect, type, direction, duration, delay ] = interaction.split( DELIMITER );
	const defaultInteractionDetails = getDefaultInteractionDetails();

	const parsedDirection = direction || defaultInteractionDetails.direction;
	const shouldAutoSelectDirection = effect === 'slide' && ! parsedDirection;

	return {
		trigger: trigger || defaultInteractionDetails.trigger,
		effect: effect || defaultInteractionDetails.effect,
		type: type || defaultInteractionDetails.type,
		direction: shouldAutoSelectDirection ? 'top' : parsedDirection,
		duration: duration || defaultInteractionDetails.duration,
		delay: delay || defaultInteractionDetails.delay,
	};
};

export const InteractionDetails = ( { interaction, onChange }: InteractionDetailsProps ) => {
	const interactionDetails = React.useMemo( () => {
		return buildInteractionDetails( interaction );
	}, [ interaction ] );

	const handleChange = < K extends keyof typeof interactionDetails >(
		key: K,
		value: ( typeof interactionDetails )[ K ]
	) => {
		if ( value === null ) {
			value = getDefaultInteractionDetails()[ key ];
		}
		const newInteractionDetails = { ...interactionDetails, [ key ]: value };

		if ( key === 'effect' && value === 'slide' ) {
			const currentDirection = newInteractionDetails.direction;
			if ( ! currentDirection || currentDirection === '' ) {
				newInteractionDetails.direction = 'top';
			}
		}

		onChange( Object.values( newInteractionDetails ).join( DELIMITER ) );
	};

	return (
		<PopoverContent p={ 1.5 }>
			<Grid container spacing={ 1.5 }>
				<Trigger value={ interactionDetails.trigger } onChange={ ( v ) => handleChange( 'trigger', v ) } />
			</Grid>
			<Divider sx={ { mx: 1.5 } } />
			<Grid container spacing={ 1.5 }>
				<Effect value={ interactionDetails.effect } onChange={ ( v ) => handleChange( 'effect', v ) } />
				<EffectType value={ interactionDetails.type } onChange={ ( v ) => handleChange( 'type', v ) } />
				<Direction
					value={ interactionDetails.effect === 'slide' && ! interactionDetails.direction ? 'top' : interactionDetails.direction }
					onChange={ ( v ) => {
						const directionValue = interactionDetails.effect === 'slide' && ( ! v || v === '' ) ? 'top' : v;
						handleChange( 'direction', directionValue );
					} }
					interactionType={ interactionDetails.type }
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
		</PopoverContent>
	);
};
