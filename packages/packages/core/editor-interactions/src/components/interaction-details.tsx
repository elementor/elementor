import * as React from 'react';
import { type PropsWithChildren, useMemo } from 'react';
import { ControlFormLabel, PopoverContent, PopoverGridContainer } from '@elementor/editor-controls';
import { Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsControl } from '../interactions-controls-registry';
import type { InteractionItemValue, NumberPropValue } from '../types';
import { INTERACTION_DEFAULT_CONFIG } from '../utils/interaction-default-config';
import { createAnimationPreset, createString, extractBoolean, extractString } from '../utils/prop-value-utils';
import { Direction } from './controls/direction';
import { Effect } from './controls/effect';
import { EffectType } from './controls/effect-type';
import { TimeFrameIndicator } from './controls/time-frame-indicator';

type InteractionDetailsProps = {
	interaction: InteractionItemValue;
	onChange: ( interaction: InteractionItemValue ) => void;
	onPlayInteraction: ( interactionId: string ) => void;
};

const TRIGGERS_WITH_REPLAY = [ 'scrollIn', 'scrollOut' ];

export const InteractionDetails = ( { interaction, onChange, onPlayInteraction }: InteractionDetailsProps ) => {
	const trigger = extractString( interaction.trigger, INTERACTION_DEFAULT_CONFIG.trigger );
	const effect = extractString( interaction.animation.value.effect, INTERACTION_DEFAULT_CONFIG.effect );
	const type = extractString( interaction.animation.value.type, INTERACTION_DEFAULT_CONFIG.type );
	const direction = extractString( interaction.animation.value.direction, INTERACTION_DEFAULT_CONFIG.direction );
	const replay = extractBoolean(
		interaction.animation.value.config?.value.replay,
		INTERACTION_DEFAULT_CONFIG.replay
	);

	const duration = interaction.animation.value.timing_config.value.duration;
	const delay = interaction.animation.value.timing_config.value.delay;

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
			duration: NumberPropValue;
			delay: NumberPropValue;
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
						value={ duration }
						onChange={ ( value ) => updateInteraction( { duration: value } ) }
						defaultValue={ INTERACTION_DEFAULT_CONFIG.duration }
					/>
				</Field>

				<Field label={ __( 'Delay', 'elementor' ) }>
					<TimeFrameIndicator
						value={ delay }
						onChange={ ( value ) => updateInteraction( { delay: value } ) }
						defaultValue={ INTERACTION_DEFAULT_CONFIG.delay }
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
