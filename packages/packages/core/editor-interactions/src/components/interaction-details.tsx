import * as React from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { Direction } from './controls/direction';
import { Effect } from './controls/effect';
import { EffectType } from './controls/effect-type';
import { TimeFrameIndicator } from './controls/time-frame-indicator';
import { Trigger } from './controls/trigger';
import type { InteractionItemValue } from '../types';
import {
	createAnimationPreset,
	createString,
	extractNumber,
	extractString,
} from '../utils/prop-value-utils';

type InteractionDetailsProps = {
	interaction: InteractionItemValue;
	onChange: ( interaction: InteractionItemValue ) => void;
};

const DEFAULT_VALUES = {
	trigger: 'load',
	effect: 'fade',
	type: 'in',
	direction: '',
	duration: 300,
	delay: 0,
};

export const InteractionDetails = ( { interaction, onChange }: InteractionDetailsProps ) => {
	const trigger = extractString( interaction.trigger, DEFAULT_VALUES.trigger );
	const effect = extractString( interaction.animation.value.effect, DEFAULT_VALUES.effect );
	const type = extractString( interaction.animation.value.type, DEFAULT_VALUES.type );
	const direction = extractString( interaction.animation.value.direction, DEFAULT_VALUES.direction );
	const duration = extractNumber( interaction.animation.value.timing_config.value.duration, DEFAULT_VALUES.duration );
	const delay = extractNumber( interaction.animation.value.timing_config.value.delay, DEFAULT_VALUES.delay );

	const effectiveDirection = effect === 'slide' && ! direction ? 'top' : direction;

	const updateInteraction = (
		newTrigger: string,
		newEffect: string,
		newType: string,
		newDirection: string,
		newDuration: number,
		newDelay: number
	): void => {
		onChange( {
			...interaction,
			trigger: createString( newTrigger ),
			animation: createAnimationPreset( newEffect, newType, newDirection, newDuration, newDelay ),
		} );
	};

	const handleTriggerChange = ( newTrigger: string ) => {
		updateInteraction( newTrigger, effect, type, direction, duration, delay );
	};

	const handleEffectChange = ( newEffect: string ) => {
		const newDirection = newEffect === 'slide' && ! direction ? 'top' : direction;
		updateInteraction( trigger, newEffect, type, newDirection, duration, delay );
	};

	const handleTypeChange = ( newType: string ) => {
		updateInteraction( trigger, effect, newType, direction, duration, delay );
	};

	const handleDirectionChange = ( newDirection: string ) => {
		const directionValue = effect === 'slide' && ( ! newDirection || newDirection === '' ) ? 'top' : newDirection;
		updateInteraction( trigger, effect, type, directionValue, duration, delay );
	};

	const handleDurationChange = ( newDuration: string ) => {
		updateInteraction( trigger, effect, type, direction, parseInt( newDuration, 10 ), delay );
	};

	const handleDelayChange = ( newDelay: string ) => {
		updateInteraction( trigger, effect, type, direction, duration, parseInt( newDelay, 10 ) );
	};

	return (
		<PopoverContent p={ 1.5 }>
			<Grid container spacing={ 1.5 }>
				<Trigger value={ trigger } onChange={ handleTriggerChange } />
			</Grid>
			<Divider sx={ { mx: 1.5 } } />
			<Grid container spacing={ 1.5 }>
				<Effect value={ effect } onChange={ handleEffectChange } />
				<EffectType value={ type } onChange={ handleTypeChange } />
				<Direction
					value={ effectiveDirection }
					onChange={ handleDirectionChange }
					interactionType={ type }
				/>
				<TimeFrameIndicator
					value={ String( duration ) }
					onChange={ handleDurationChange }
					label={ __( 'Duration', 'elementor' ) }
				/>
				<TimeFrameIndicator
					value={ String( delay ) }
					onChange={ handleDelayChange }
					label={ __( 'Delay', 'elementor' ) }
				/>
			</Grid>
		</PopoverContent>
	);
};
