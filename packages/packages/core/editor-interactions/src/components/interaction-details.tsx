import * as React from 'react';
import { type PropsWithChildren, useMemo } from 'react';
import { ControlFormLabel, PopoverContent, PopoverGridContainer } from '@elementor/editor-controls';
import { Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsControl } from '../interactions-controls-registry';
import type { InteractionItemValue, NumberPropValue } from '../types';
import { INTERACTION_DEFAULT_CONFIG } from '../utils/interaction-default-config';
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
	relativeTo: 'viewport',
	offsetTop: 15,
	offsetBottom: 85,
};

const TRIGGERS_WITH_REPLAY = [ 'scrollIn', 'scrollOut' ];

export const InteractionDetails = ( { interaction, onChange, onPlayInteraction }: InteractionDetailsProps ) => {
	const trigger = extractString( interaction.trigger, INTERACTION_DEFAULT_CONFIG.trigger );
	const effect = extractString( interaction.animation.value.effect, INTERACTION_DEFAULT_CONFIG.effect );
	const type = extractString( interaction.animation.value.type, INTERACTION_DEFAULT_CONFIG.type );
	const direction = extractString( interaction.animation.value.direction, INTERACTION_DEFAULT_CONFIG.direction );
	const relativeTo = extractString( interaction.animation.value.config?.value.relativeTo, DEFAULT_VALUES.relativeTo );
	const offsetTop = extractNumber( interaction.animation.value.config?.value.offsetTop, DEFAULT_VALUES.offsetTop );
	const offsetBottom = extractNumber(
		interaction.animation.value.config?.value.offsetBottom,
		DEFAULT_VALUES.offsetBottom
	);
	const replay = extractBoolean(
		interaction.animation.value.config?.value.replay,
		INTERACTION_DEFAULT_CONFIG.replay
	);

	const duration = interaction.animation.value.timing_config.value.duration;
	const delay = interaction.animation.value.timing_config.value.delay;

	const shouldShowReplay = TRIGGERS_WITH_REPLAY.includes( trigger );
	const shouldShowRelativeTo = trigger === 'scrollOn';

	const TriggerControl = useMemo( () => {
		return getInteractionsControl( 'trigger' )?.component ?? null;
	}, [] );

	const ReplayControl = useMemo( () => {
		if ( ! shouldShowReplay ) {
			return null;
		}
		return getInteractionsControl( 'replay' )?.component ?? null;
	}, [ shouldShowReplay ] );

	const RelativeToControl = useMemo( () => {
		if ( ! shouldShowRelativeTo ) {
			return null;
		}
		return getInteractionsControl( 'relativeTo' )?.component ?? null;
	}, [ shouldShowRelativeTo ] );

	const OffsetTopControl = useMemo( () => {
		if ( ! shouldShowRelativeTo ) {
			return null;
		}
		return getInteractionsControl( 'offsetTop' )?.component ?? null;
	}, [ shouldShowRelativeTo ] );

	const OffsetBottomControl = useMemo( () => {
		if ( ! shouldShowRelativeTo ) {
			return null;
		}
		return getInteractionsControl( 'offsetBottom' )?.component ?? null;
	}, [ shouldShowRelativeTo ] );

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
			relativeTo: string;
			offsetTop: number;
			offsetBottom: number;
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
				relativeTo: updates.relativeTo ?? relativeTo,
				offsetTop: updates.offsetTop ?? offsetTop,
				offsetBottom: updates.offsetBottom ?? offsetBottom,
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
			{ shouldShowRelativeTo && RelativeToControl && (
				<>
					<Divider />
					<Grid container spacing={ 1.5 }>
						<Field label={ __( 'Relative To', 'elementor' ) }>
							<RelativeToControl
								value={ relativeTo }
								onChange={ ( v ) => updateInteraction( { relativeTo: v } ) }
							/>
						</Field>
						{ OffsetTopControl && (
							<Field label={ __( 'Offset Top', 'elementor' ) }>
								<OffsetTopControl
									value={ String( offsetTop ) }
									onChange={ ( v: string ) => updateInteraction( { offsetTop: parseInt( v, 10 ) } ) }
								/>
							</Field>
						) }
						{ OffsetBottomControl && (
							<Field label={ __( 'Offset Bottom', 'elementor' ) }>
								<OffsetBottomControl
									value={ String( offsetBottom ) }
									onChange={ ( v: string ) =>
										updateInteraction( { offsetBottom: parseInt( v, 10 ) } )
									}
								/>
							</Field>
						) }
					</Grid>
					<Divider />
				</>
			) }
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
