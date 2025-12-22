import * as React from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsControl } from '../interactions-controls-registry';
import type { InteractionItemValue } from '../types';
import { createAnimationPreset, createString, extractNumber, extractString } from '../utils/prop-value-utils';
import { Direction } from './controls/direction';
import { Effect } from './controls/effect';
import { EffectType } from './controls/effect-type';
import { TimeFrameIndicator } from './controls/time-frame-indicator';
import { Trigger } from './controls/trigger';

type InteractionDetailsProps = {
	interaction: InteractionItemValue;
	onChange: ( interaction: InteractionItemValue ) => void;
};

// Temporary until pro control implemented
type WindowWithElementorPro = Window & {
	elementorPro?: unknown;
};

const DEFAULT_VALUES = {
	trigger: 'load',
	effect: 'fade',
	type: 'in',
	direction: '',
	duration: 300,
	delay: 0,
	replay: false,
};

export const InteractionDetails = ( { interaction, onChange }: InteractionDetailsProps ) => {
	const trigger = extractString( interaction.trigger, DEFAULT_VALUES.trigger );
	const effect = extractString( interaction.animation.value.effect, DEFAULT_VALUES.effect );
	const type = extractString( interaction.animation.value.type, DEFAULT_VALUES.type );
	const direction = extractString( interaction.animation.value.direction, DEFAULT_VALUES.direction );
	const duration = extractNumber( interaction.animation.value.timing_config.value.duration, DEFAULT_VALUES.duration );
	const delay = extractNumber( interaction.animation.value.timing_config.value.delay, DEFAULT_VALUES.delay );
	const replay = DEFAULT_VALUES.replay;

	const ReplayControl = getInteractionsControl( 'replay' )?.component ?? null;
	const effectiveDirection = effect === 'slide' && ! direction ? 'top' : direction;
	// Temporary until pro control implemented
	const hasPro = !! ( window as WindowWithElementorPro ).elementorPro;
	const shouldShowReplay = ReplayControl && ! hasPro;

	const updateInteraction = (
		updates: Partial< {
			trigger: string;
			effect: string;
			type: string;
			direction: string;
			duration: number;
			delay: number;
		} >
	): void => {
		const newEffect = updates.effect ?? effect;
		const newDirection = updates.direction ?? direction;

		const resolvedDirection = newEffect === 'slide' && ! newDirection ? 'top' : newDirection;

		onChange( {
			...interaction,
			trigger: createString( updates.trigger ?? trigger ),
			animation: createAnimationPreset(
				newEffect,
				updates.type ?? type,
				resolvedDirection,
				updates.duration ?? duration,
				updates.delay ?? delay
			),
		} );
	};

	return (
		<PopoverContent p={ 1.5 }>
			<Grid container spacing={ 1.5 }>
				<Trigger value={ trigger } onChange={ ( v ) => updateInteraction( { trigger: v } ) } />
			</Grid>
			<Divider sx={ { mx: 1.5 } } />
			<Grid container spacing={ 1.5 }>
				<Effect value={ effect } onChange={ ( v ) => updateInteraction( { effect: v } ) } />
				<EffectType value={ type } onChange={ ( v ) => updateInteraction( { type: v } ) } />
				<Direction
					value={ effectiveDirection }
					onChange={ ( v ) => updateInteraction( { direction: v } ) }
					interactionType={ type }
				/>
				<TimeFrameIndicator
					value={ String( duration ) }
					onChange={ ( v ) => updateInteraction( { duration: parseInt( v, 10 ) } ) }
					label={ __( 'Duration', 'elementor' ) }
				/>
				<TimeFrameIndicator
					value={ String( delay ) }
					onChange={ ( v ) => updateInteraction( { delay: parseInt( v, 10 ) } ) }
					label={ __( 'Delay', 'elementor' ) }
				/>
			</Grid>
			{ shouldShowReplay && (
				<>
					<Divider />
					<Grid container spacing={ 1.5 }>
						<ReplayControl value={ replay } onChange={ () => {} } disabled={ true } />
					</Grid>
				</>
			) }
		</PopoverContent>
	);
};
