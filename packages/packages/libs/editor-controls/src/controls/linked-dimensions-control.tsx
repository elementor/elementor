import * as React from 'react';
import { type RefObject, useRef } from 'react';
import { dimensionsPropTypeUtil, type PropKey, sizePropTypeUtil } from '@elementor/editor-props';
import { DetachIcon, LinkIcon, SideBottomIcon, SideLeftIcon, SideRightIcon, SideTopIcon } from '@elementor/icons';
import { Grid, Stack, ToggleButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { createControl } from '../create-control';
import { type ExtendedOption } from '../utils/size-control';
import { SizeControl } from './size-control';

export const LinkedDimensionsControl = createControl(
	( {
		label,
		isSiteRtl = false,
		extendedOptions,
	}: {
		label: string;
		isSiteRtl?: boolean;
		extendedOptions?: ExtendedOption[];
	} ) => {
		const { value: sizeValue, setValue: setSizeValue, disabled: sizeDisabled } = useBoundProp( sizePropTypeUtil );
		const gridRowRefs: RefObject< HTMLDivElement >[] = [ useRef( null ), useRef( null ) ];

		const {
			value: dimensionsValue,
			setValue: setDimensionsValue,
			propType,
			disabled: dimensionsDisabled,
		} = useBoundProp( dimensionsPropTypeUtil );

		const isLinked = ! dimensionsValue && ! sizeValue ? true : !! sizeValue;

		const onLinkToggle = () => {
			if ( ! isLinked ) {
				setSizeValue( dimensionsValue[ 'block-start' ]?.value ?? null );
				return;
			}

			const value = sizeValue ? sizePropTypeUtil.create( sizeValue ) : null;

			setDimensionsValue( {
				'block-start': value,
				'block-end': value,
				'inline-start': value,
				'inline-end': value,
			} );
		};

		const tooltipLabel = label.toLowerCase();

		const LinkedIcon = isLinked ? LinkIcon : DetachIcon;
		// translators: %s: Tooltip title.
		const linkedLabel = __( 'Link %s', 'elementor' ).replace( '%s', tooltipLabel );
		// translators: %s: Tooltip title.
		const unlinkedLabel = __( 'Unlink %s', 'elementor' ).replace( '%s', tooltipLabel );

		const disabled = sizeDisabled || dimensionsDisabled;

		return (
			<PropProvider
				propType={ propType }
				value={ dimensionsValue }
				setValue={ setDimensionsValue }
				isDisabled={ () => disabled }
			>
				<Stack direction="row" gap={ 2 } flexWrap="nowrap">
					<ControlFormLabel>{ label }</ControlFormLabel>
					<Tooltip title={ isLinked ? unlinkedLabel : linkedLabel } placement="top">
						<ToggleButton
							aria-label={ isLinked ? unlinkedLabel : linkedLabel }
							size={ 'tiny' }
							value={ 'check' }
							selected={ isLinked }
							sx={ { marginLeft: 'auto' } }
							onChange={ onLinkToggle }
							disabled={ disabled }
						>
							<LinkedIcon fontSize={ 'tiny' } />
						</ToggleButton>
					</Tooltip>
				</Stack>

				{ getCssMarginProps( isSiteRtl ).map( ( row, index ) => (
					<Stack direction="row" gap={ 2 } flexWrap="nowrap" key={ index } ref={ gridRowRefs[ index ] }>
						{ row.map( ( { icon, ...props } ) => (
							<Grid container gap={ 0.75 } alignItems="center" key={ props.bind }>
								<Grid item xs={ 12 }>
									<Label { ...props } />
								</Grid>
								<Grid item xs={ 12 }>
									<Control
										bind={ props.bind }
										startIcon={ icon }
										isLinked={ isLinked }
										extendedOptions={ extendedOptions }
										anchorRef={ gridRowRefs[ index ] }
									/>
								</Grid>
							</Grid>
						) ) }
					</Stack>
				) ) }
			</PropProvider>
		);
	}
);

const Control = ( {
	bind,
	startIcon,
	isLinked,
	extendedOptions,
	anchorRef,
}: {
	bind: PropKey;
	startIcon: React.ReactNode;
	isLinked: boolean;
	extendedOptions?: ExtendedOption[];
	anchorRef: RefObject< HTMLDivElement >;
} ) => {
	if ( isLinked ) {
		return <SizeControl startIcon={ startIcon } extendedOptions={ extendedOptions } anchorRef={ anchorRef } />;
	}

	return (
		<PropKeyProvider bind={ bind }>
			<SizeControl startIcon={ startIcon } extendedOptions={ extendedOptions } anchorRef={ anchorRef } />
		</PropKeyProvider>
	);
};

const Label = ( { label, bind }: { label: string; bind: PropKey } ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<ControlLabel>{ label }</ControlLabel>
		</PropKeyProvider>
	);
};

function getCssMarginProps( isSiteRtl: boolean ) {
	return [
		[
			{
				bind: 'block-start',
				label: __( 'Top', 'elementor' ),
				icon: <SideTopIcon fontSize={ 'tiny' } />,
			},
			{
				bind: 'inline-end',
				label: isSiteRtl ? __( 'Left', 'elementor' ) : __( 'Right', 'elementor' ),
				icon: isSiteRtl ? <SideLeftIcon fontSize={ 'tiny' } /> : <SideRightIcon fontSize={ 'tiny' } />,
			},
		],
		[
			{
				bind: 'block-end',
				label: __( 'Bottom', 'elementor' ),
				icon: <SideBottomIcon fontSize={ 'tiny' } />,
			},
			{
				bind: 'inline-start',
				label: isSiteRtl ? __( 'Right', 'elementor' ) : __( 'Left', 'elementor' ),
				icon: isSiteRtl ? <SideRightIcon fontSize={ 'tiny' } /> : <SideLeftIcon fontSize={ 'tiny' } />,
			},
		],
	];
}
