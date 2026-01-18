import * as React from 'react';
import { type PropsWithChildren, useMemo } from 'react';
import { ControlFormLabel, PopoverContent, PopoverGridContainer } from '@elementor/editor-controls';
import { Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsControl } from '../interactions-controls-registry';
import type { InteractionItemValue } from '../types';
import {
	createAnimationPreset,
	createString,
	extractBoolean,
	extractNumber,
	extractString,
} from '../utils/prop-value-utils';
import { Direction } from './controls/direction';
import { Effect } from './controls/effect';
import { EffectType } from './controls/effect-type';
import { TimeFrameIndicator } from './controls/time-frame-indicator';

type InteractionDetailsProps = {
	interaction: InteractionItemValue;
	onChange: ( interaction: InteractionItemValue ) => void;
	onPlayInteraction: ( interactionId: string ) => void;
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

const TRIGGERS_WITH_REPLAY = [ 'scrollIn', 'scrollOut' ];

export const InteractionDetails = ( { interaction, onChange, onPlayInteraction }: InteractionDetailsProps ) => {
	const trigger = extractString( interaction.trigger, DEFAULT_VALUES.trigger );
	const effect = extractString( interaction.animation.value.effect, DEFAULT_VALUES.effect );
	const type = extractString( interaction.animation.value.type, DEFAULT_VALUES.type );
	const direction = extractString( interaction.animation.value.direction, DEFAULT_VALUES.direction );
	const duration = extractNumber( interaction.animation.value.timing_config.value.duration, DEFAULT_VALUES.duration );
	const delay = extractNumber( interaction.animation.value.timing_config.value.delay, DEFAULT_VALUES.delay );
	const replay = extractBoolean( interaction.animation.value.config?.value.replay, DEFAULT_VALUES.replay );

	const shouldShowReplay = TRIGGERS_WITH_REPLAY.includes( trigger );

	const TriggerControl = useMemo( () => {
		return getInteractionsControl( 'trigger' )?.component ?? null;
	}, [] );

	const ReplayControl = useMemo( () => {
		if ( ! shouldShowReplay ) {
			return null;
		}
		return getInteractionsControl( 'replay' )?.component ?? null;
	}, [ shouldShowReplay ] );

	const resolveDirection = ( hasDirection: boolean, newEffect?: string, newDirection?: string ) => {
		if ( newEffect === 'slide' && ! newDirection ) {
			return 'top';
		}
		// Why? - New direction can be undefined when the effect is not slide, so if the updates object includes direction, we take it always!
		if ( hasDirection ) {
			return newDirection;
		}
		return direction;
	};

	const updateInteraction = (
		updates: Partial< {
			trigger: string;
			effect: string;
			type: string;
			direction: string;
			duration: number;
			delay: number;
			replay: boolean;
		} >
	): void => {
		const resolvedDirectionValue = resolveDirection( 'direction' in updates, updates.effect, updates.direction );
		const newReplay = updates.replay !== undefined ? updates.replay : replay;

		const updatedInteraction = {
			...interaction,
			interaction_id: interaction.interaction_id,
			trigger: createString( updates.trigger ?? trigger ),
			animation: createAnimationPreset( {
				effect: updates.effect ?? effect,
				type: updates.type ?? type,
				direction: resolvedDirectionValue,
				duration: updates.duration ?? duration,
				delay: updates.delay ?? delay,
				replay: newReplay,
			} ),
		};

		onChange( updatedInteraction );

		const interactionId = extractString( updatedInteraction.interaction_id );

		setTimeout( () => {
			onPlayInteraction( interactionId );
		}, 0 );
	};

	return (
		<PopoverContent p={ 1.5 }>
			<Grid container spacing={ 1.5 }>
				{ TriggerControl && (
					<Field label={ __( 'Trigger', 'elementor' ) }>
						<TriggerControl value={ trigger } onChange={ ( v ) => updateInteraction( { trigger: v } ) } />
					</Field>
				) }

				{ ReplayControl && (
					<Field label={ __( 'Replay', 'elementor' ) }>
						<ReplayControl
							value={ replay }
							onChange={ ( v ) => updateInteraction( { replay: v } ) }
							disabled={ true }
						/>
					</Field>
				) }
			</Grid>

			<Divider />

			<Grid container spacing={ 1.5 }>
				<Field label={ __( 'Effect', 'elementor' ) }>
					<Effect value={ effect } onChange={ ( v ) => updateInteraction( { effect: v } ) } />
				</Field>

				<Field label={ __( 'Type', 'elementor' ) }>
					<EffectType value={ type } onChange={ ( v ) => updateInteraction( { type: v } ) } />
				</Field>

				<Field label={ __( 'Direction', 'elementor' ) }>
					<Direction
						value={ direction }
						onChange={ ( v ) => updateInteraction( { direction: v } ) }
						interactionType={ type }
					/>
				</Field>

				<Field label={ __( 'Duration', 'elementor' ) }>
					<TimeFrameIndicator
						value={ String( duration ) }
						onChange={ ( v ) => updateInteraction( { duration: parseInt( v, 10 ) } ) }
					/>
				</Field>

				<Field label={ __( 'Delay', 'elementor' ) }>
					<TimeFrameIndicator
						value={ String( delay ) }
						onChange={ ( v ) => updateInteraction( { delay: parseInt( v, 10 ) } ) }
					/>
				</Field>
			</Grid>
		</PopoverContent>
	);
};

type FieldProps = {
	label: string;
} & PropsWithChildren;

function Field( { label, children }: FieldProps ) {
	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer>
				<Grid item xs={ 6 }>
					<ControlFormLabel>{ label }</ControlFormLabel>
				</Grid>
				<Grid item xs={ 6 }>
					{ children }
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
}
