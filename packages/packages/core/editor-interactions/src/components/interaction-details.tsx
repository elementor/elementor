import * as React from 'react';
import { type ComponentType, useMemo, useRef } from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { type PropValue } from '@elementor/editor-props';
import { Box, Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsControl } from '../interactions-controls-registry';
import { type FieldProps, type InteractionItemValue, type SizeStringValue } from '../types';
import {
	createAnimationPreset,
	createString,
	extractBoolean,
	extractSize,
	extractString,
} from '../utils/prop-value-utils';
import { resolveDirection } from '../utils/resolve-direction';
import { parseSizeValue } from '../utils/size-transform-utils';
import { TimeFrameIndicator } from './controls/time-frame-indicator';
import { Field } from './field';

type InteractionDetailsProps = {
	interaction: InteractionItemValue;
	onChange: ( interaction: InteractionItemValue ) => void;
	onPlayInteraction: ( interactionId: string ) => void;
};

export const DEFAULT_VALUES = {
	trigger: 'load',
	effect: 'fade',
	type: 'in',
	direction: '',
	duration: 600,
	delay: 0,
	replay: false,
	easing: 'easeIn',
	relativeTo: 'viewport',
	start: 85,
	end: 15,
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
	| 'start'
	| 'end'
	| 'customEffects';

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
	start: SizeStringValue;
	end: SizeStringValue;
	customEffects?: PropValue;
};

type ControlVisibilityConfig = {
	[ key: string ]: ( values: InteractionValues ) => boolean;
};

const controlVisibilityConfig: ControlVisibilityConfig = {
	replay: ( values ) => ! TRIGGERS_WITHOUT_REPLAY.includes( values.trigger ),
	custom: ( values ) => values.effect === 'custom',
	effectType: ( values ) => values.effect !== 'custom',
	direction: ( values ) => values.effect !== 'custom',
	relativeTo: ( values ) => values.trigger === 'scrollOn',
	start: ( values ) => values.trigger === 'scrollOn',
	end: ( values ) => values.trigger === 'scrollOn',

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
	const customEffects = interaction.animation.value.custom_effect;
	const type = extractString( interaction.animation.value.type, DEFAULT_VALUES.type );
	const direction = extractString( interaction.animation.value.direction, DEFAULT_VALUES.direction );
	const duration = extractSize( interaction.animation.value.timing_config.value.duration );
	const delay = extractSize( interaction.animation.value.timing_config.value.delay );
	const replay = extractBoolean( interaction.animation.value.config?.value.replay, DEFAULT_VALUES.replay );
	const easing = extractString( interaction.animation.value.config?.value.easing, DEFAULT_VALUES.easing );
	const relativeTo = extractString( interaction.animation.value.config?.value.relativeTo, DEFAULT_VALUES.relativeTo );

	const start = extractSize(
		interaction.animation.value.config?.value.start,
		DEFAULT_VALUES.start
	);
	const end = extractSize(
		interaction.animation.value.config?.value.end,
		DEFAULT_VALUES.end
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
		start,
		end,
		customEffects,
	};

	const TriggerControl = useControlComponent( 'trigger', true );
	const EffectControl = useControlComponent( 'effect' );
	const ReplayControl = useControlComponent( 'replay', controlVisibilityConfig.replay( interactionValues ) );
	const RelativeToControl = useControlComponent(
		'relativeTo',
		controlVisibilityConfig.relativeTo( interactionValues )
	);
	const StartControl = useControlComponent(
		'start',
		controlVisibilityConfig.start( interactionValues )
	);
	const EndControl = useControlComponent(
		'end',
		controlVisibilityConfig.end( interactionValues )
	);
	const CustomEffectControl = useControlComponent(
		'customEffects',
		controlVisibilityConfig.custom( interactionValues )
	) as ComponentType< FieldProps< PropValue > >;

	const EffectTypeControl = useControlComponent(
		'effectType',
		controlVisibilityConfig.effectType( interactionValues )
	);
	const DirectionControl = useControlComponent( 'direction', controlVisibilityConfig.direction( interactionValues ) );
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
			start: SizeStringValue;
			end: SizeStringValue;
			customEffects?: PropValue;
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
				start: updates.start ?? start,
				end: updates.end ?? end,
				customEffects: updates.customEffects ?? customEffects,
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
							<TriggerControl
								value={ trigger }
								onChange={ ( v ) => updateInteraction( { trigger: v } ) }
							/>
						</Field>
					) }

					{ ReplayControl && (
						<Field label={ __( 'Replay', 'elementor' ) }>
							<ReplayControl
								value={ replay }
								onChange={ ( v ) => updateInteraction( { replay: v } ) }
								disabled={ true }
								anchorRef={ containerRef }
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

					{ CustomEffectControl && (
						<Field label={ __( 'Custom Effect', 'elementor' ) }>
							<CustomEffectControl
								value={ customEffects }
								onChange={ ( v: PropValue ) => updateInteraction( { customEffects: v } ) }
							/>
						</Field>
					) }

					{ EffectTypeControl && (
						<Field label={ __( 'Type', 'elementor' ) }>
							<EffectTypeControl value={ type } onChange={ ( v ) => updateInteraction( { type: v } ) } />
						</Field>
					) }

					{ DirectionControl && (
						<Field label={ __( 'Direction', 'elementor' ) }>
							<DirectionControl
								value={ direction }
								onChange={ ( v ) => updateInteraction( { direction: v } ) }
								interactionType={ type }
							/>
						</Field>
					) }

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
							{ StartControl && (
								<Field label={ __( 'Start', 'elementor' ) }>
									<StartControl
										value={ parseSizeValue( start, [ '%' ] ).size?.toString() ?? '' }
										onChange={ ( v: string ) =>
											updateInteraction( { start: v as SizeStringValue } )
										}
									/>
								</Field>
							) }
							{ EndControl && (
								<Field label={ __( 'End', 'elementor' ) }>
									<EndControl
										value={ parseSizeValue( end, [ '%' ] ).size?.toString() ?? '' }
										onChange={ ( v: string ) =>
											updateInteraction( { end: v as SizeStringValue } )
										}
									/>
								</Field>
							) }
							<Field label={ __( 'Relative To', 'elementor' ) }>
								<RelativeToControl
									value={ relativeTo }
									onChange={ ( v ) => updateInteraction( { relativeTo: v } ) }
								/>
							</Field>
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
