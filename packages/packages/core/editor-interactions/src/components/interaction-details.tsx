import * as React from 'react';
import { useMemo, useRef } from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { Box, Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsControl } from '../interactions-controls-registry';
import { type InteractionItemValue, type SizeStringValue } from '../types';
import {
	createAnimationPreset,
	createString,
	extractBoolean,
	extractSize,
	extractString,
} from '../utils/prop-value-utils';
import { resolveDirection } from '../utils/resolve-direction';
import { parseSizeValue } from '../utils/size-transform-utils';
import { Direction } from './controls/direction';
import { EffectType } from './controls/effect-type';
import { TimeFrameIndicator } from './controls/time-frame-indicator';
import { Field } from './field';

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
	duration: 600,
	delay: 0,
	replay: false,
	easing: 'easeIn',
	relativeTo: 'viewport',
	offsetTop: 15,
	offsetBottom: 85,
};

const TRIGGERS_WITHOUT_REPLAY = [ 'load', 'scrollOn', 'hover', 'click' ];

type InteractionsControlType =
	| 'trigger'
	| 'effect'
	| 'effectType'
	| 'direction'
	| 'duration'
	| 'delay'
	| 'replay'
	| 'easing'
	| 'relativeTo'
	| 'offsetTop'
	| 'offsetBottom';

type InteractionValues = {
	trigger: string;
	effect: string;
	type: string;
	direction: string;
	duration: SizeStringValue;
	delay: SizeStringValue;
	replay: boolean;
	easing: string;
	relativeTo: string;
	offsetTop: SizeStringValue;
	offsetBottom: SizeStringValue;
};

type ControlVisibilityConfig = {
	[ key: string ]: ( values: InteractionValues ) => boolean;
};

const controlVisibilityConfig: ControlVisibilityConfig = {
	replay: ( values ) => ! TRIGGERS_WITHOUT_REPLAY.includes( values.trigger ),

	relativeTo: ( values ) => values.trigger === 'scrollOn',
	offsetTop: ( values ) => values.trigger === 'scrollOn',
	offsetBottom: ( values ) => values.trigger === 'scrollOn',

	duration: ( values ) => {
		const isRelativeToVisible = values.trigger === 'scrollOn';
		return ! isRelativeToVisible;
	},
	delay: ( values ) => {
		const isRelativeToVisible = values.trigger === 'scrollOn';
		return ! isRelativeToVisible;
	},
};

function useControlComponent( controlName: InteractionsControlType, isVisible: boolean = true ) {
	return useMemo( () => {
		if ( ! isVisible ) {
			return null;
		}
		return getInteractionsControl( controlName )?.component ?? null;
	}, [ controlName, isVisible ] );
}

export const InteractionDetails = ( { interaction, onChange, onPlayInteraction }: InteractionDetailsProps ) => {
	const trigger = extractString( interaction.trigger, DEFAULT_VALUES.trigger );
	const effect = extractString( interaction.animation.value.effect, DEFAULT_VALUES.effect );
	const type = extractString( interaction.animation.value.type, DEFAULT_VALUES.type );
	const direction = extractString( interaction.animation.value.direction, DEFAULT_VALUES.direction );
	const duration = extractSize( interaction.animation.value.timing_config.value.duration );
	const delay = extractSize( interaction.animation.value.timing_config.value.delay );
	const replay = extractBoolean( interaction.animation.value.config?.value.replay, DEFAULT_VALUES.replay );
	const easing = extractString( interaction.animation.value.config?.value.easing, DEFAULT_VALUES.easing );
	const relativeTo = extractString( interaction.animation.value.config?.value.relativeTo, DEFAULT_VALUES.relativeTo );

	const offsetTop = extractSize( interaction.animation.value.config?.value.offsetTop, DEFAULT_VALUES.offsetTop );
	const offsetBottom = extractSize(
		interaction.animation.value.config?.value.offsetBottom,
		DEFAULT_VALUES.offsetBottom
	);

	const interactionValues = {
		trigger,
		effect,
		type,
		direction,
		duration,
		delay,
		easing,
		replay,
		relativeTo,
		offsetTop,
		offsetBottom,
	};

	const TriggerControl = useControlComponent( 'trigger', true );
	const EffectControl = useControlComponent( 'effect' );
	const ReplayControl = useControlComponent( 'replay', controlVisibilityConfig.replay( interactionValues ) );
	const RelativeToControl = useControlComponent(
		'relativeTo',
		controlVisibilityConfig.relativeTo( interactionValues )
	);
	const OffsetTopControl = useControlComponent( 'offsetTop', controlVisibilityConfig.offsetTop( interactionValues ) );
	const OffsetBottomControl = useControlComponent(
		'offsetBottom',
		controlVisibilityConfig.offsetBottom( interactionValues )
	);

	const EasingControl = useControlComponent( 'easing' );

	const containerRef = useRef< HTMLDivElement >( null );

	const updateInteraction = (
		updates: Partial< {
			trigger: string;
			effect: string;
			type: string;
			direction: string;
			duration: SizeStringValue;
			delay: SizeStringValue;
			replay: boolean;
			easing?: string;
			relativeTo: string;
			offsetTop: SizeStringValue;
			offsetBottom: SizeStringValue;
		} >
	): void => {
		const resolvedDirectionValue = resolveDirection(
			'direction' in updates,
			updates.effect,
			updates.direction,
			direction,
			effect
		);

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
				replay: updates.replay ?? replay,
				easing: updates.easing ?? easing,
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
		<Box ref={ containerRef }>
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
					{ EffectControl && (
						<Field label={ __( 'Effect', 'elementor' ) }>
							<EffectControl value={ effect } onChange={ ( v ) => updateInteraction( { effect: v } ) } />
						</Field>
					) }

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

					{ controlVisibilityConfig.duration( interactionValues ) && (
						<Field label={ __( 'Duration', 'elementor' ) }>
							<TimeFrameIndicator
								value={ String( duration ) }
								onChange={ ( v ) => updateInteraction( { duration: v as SizeStringValue } ) }
								defaultValue={ DEFAULT_VALUES.duration as SizeStringValue }
							/>
						</Field>
					) }

					{ controlVisibilityConfig.delay( interactionValues ) && (
						<Field label={ __( 'Delay', 'elementor' ) }>
							<TimeFrameIndicator
								value={ String( delay ) }
								onChange={ ( v ) => updateInteraction( { delay: v as SizeStringValue } ) }
								defaultValue={ DEFAULT_VALUES.delay as SizeStringValue }
							/>
						</Field>
					) }
				</Grid>

				{ controlVisibilityConfig.relativeTo( interactionValues ) && RelativeToControl && (
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
										value={ String( parseSizeValue( offsetTop, [ '%' ] ).size ) }
										onChange={ ( v: string ) =>
											updateInteraction( { offsetTop: v as SizeStringValue } )
										}
									/>
								</Field>
							) }
							{ OffsetBottomControl && (
								<Field label={ __( 'Offset Bottom', 'elementor' ) }>
									<OffsetBottomControl
										value={ String( parseSizeValue( offsetBottom, [ '%' ] ).size ) }
										onChange={ ( v: string ) =>
											updateInteraction( { offsetBottom: v as SizeStringValue } )
										}
									/>
								</Field>
							) }
						</Grid>
						<Divider />
					</>
				) }

				{ EasingControl && (
					<Grid container spacing={ 1.5 }>
						<Field label={ __( 'Easing', 'elementor' ) }>
							<EasingControl
								value={ easing }
								onChange={ ( v ) => {
									updateInteraction( { easing: v } );
								} }
							/>
						</Field>
					</Grid>
				) }
			</PopoverContent>
		</Box>
	);
};
