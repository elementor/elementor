import * as React from 'react';
import { type ComponentType, useMemo } from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsControl } from '../interactions-controls-registry';
import {
	type CustomEffect,
	type DirectionFieldProps,
	type FieldProps,
	type InteractionItemValue,
	type ReplayFieldProps,
	type SizeStringValue,
} from '../types';
import {
	createAnimationPreset,
	createString,
	extractBoolean,
	extractCustomEffect,
	extractSize,
	extractString,
} from '../utils/prop-value-utils';
import { parseSizeValue } from '../utils/size-transform-utils';
import { Direction } from './controls/direction';
import { Effect } from './controls/effect';
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
	custom: undefined,
};

const TRIGGERS_WITHOUT_REPLAY = [ 'load', 'scrollOn' ];

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
	| 'offsetBottom'
	| 'custom';

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
	custom?: CustomEffect;
};

type ControlVisibilityConfig = {
	[ key: string ]: ( values: InteractionValues ) => boolean;
};

const controlVisibilityConfig: ControlVisibilityConfig = {
	replay: ( values ) => ! TRIGGERS_WITHOUT_REPLAY.includes( values.trigger ),
	custom: ( values ) => values.effect === 'custom',

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

type AnyControlComponent = ComponentType<
	FieldProps | FieldProps< CustomEffect > | DirectionFieldProps | ReplayFieldProps
>;

function useControlComponent(
	controlName: InteractionsControlType,
	isVisible: boolean = true
): AnyControlComponent | null {
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
	const custom = extractCustomEffect( interaction.animation.value.custom, DEFAULT_VALUES.custom );
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
		custom,
	};

	const TriggerControl = useControlComponent( 'trigger', true );
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
	const CustomEffectControl = useControlComponent( 'custom', controlVisibilityConfig.custom( interactionValues ) );

	const EasingControl = useControlComponent( 'easing' );

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
			duration: SizeStringValue;
			delay: SizeStringValue;
			replay: boolean;
			easing?: string;
			relativeTo: string;
			offsetTop: SizeStringValue;
			offsetBottom: SizeStringValue;
			custom?: CustomEffect;
		} >
	): void => {
		const resolvedDirectionValue = resolveDirection( 'direction' in updates, updates.effect, updates.direction );

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
				custom: updates.custom ?? custom,
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
							onChange={ ( v: boolean ) => updateInteraction( { replay: v } ) }
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

				{ CustomEffectControl && (
					<Field label={ __( 'Custom Effect', 'elementor' ) }>
						<CustomEffectControl
							value={ custom ?? {} }
							onChange={ ( v: CustomEffect ) => updateInteraction( { custom: v } ) }
						/>
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
	);
};
