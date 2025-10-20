import * as React from 'react';
import { useMemo, useRef } from 'react';
import { selectionSizePropTypeUtil } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { createControl } from '../create-control';
import { SizeControl, type SizeControlProps } from './size-control';

type SelectionComponentConfig = {
	component: React.ComponentType< Record< string, unknown > >;
	props: Record< string, unknown >;
};

type SizeControlConfig = Pick< SizeControlProps, 'variant' | 'units' | 'defaultUnit' >;

type SelectionSizeControlProps = {
	selectionLabel: string;
	sizeLabel: string;
	selectionConfig: SelectionComponentConfig;
	sizeConfigMap: Record< string, SizeControlConfig >;
	isRepeaterControl?: boolean;
};

export const SelectionSizeControl = createControl(
	( {
		selectionLabel,
		sizeLabel,
		selectionConfig,
		sizeConfigMap,
		isRepeaterControl = false,
	}: SelectionSizeControlProps ) => {
		const { value, setValue, propType } = useBoundProp( selectionSizePropTypeUtil );
		const rowRef = useRef< HTMLDivElement >( null );

		const sizeFieldId = sizeLabel.replace( /\s+/g, '-' ).toLowerCase();

		const currentSizeConfig = useMemo( () => {
			switch ( value.selection.$$type ) {
				case 'key-value':
					return sizeConfigMap[ value?.selection?.value.value.value || '' ];
				case 'string':
					return sizeConfigMap[ value?.selection?.value || '' ];
				default:
					return null;
			}
		}, [ value, sizeConfigMap ] );
		const SelectionComponent = selectionConfig.component;

		return (
			<PropProvider value={ value } setValue={ setValue } propType={ propType }>
				<Grid container spacing={ 1.5 } ref={ rowRef }>
					<Grid item xs={ 6 } sx={ { display: 'flex', alignItems: 'center' } }>
						<ControlFormLabel>{ selectionLabel }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 }>
						<PropKeyProvider bind="selection">
							<SelectionComponent { ...selectionConfig.props } />
						</PropKeyProvider>
					</Grid>
					{ currentSizeConfig && (
						<>
							<Grid item xs={ 6 } sx={ { display: 'flex', alignItems: 'center' } }>
								<ControlFormLabel htmlFor={ sizeFieldId }>{ sizeLabel }</ControlFormLabel>
							</Grid>
							<Grid item xs={ 6 }>
								<PropKeyProvider bind="size">
									<SizeControl
										anchorRef={ rowRef }
										variant={ currentSizeConfig.variant }
										units={ currentSizeConfig.units }
										defaultUnit={ currentSizeConfig.defaultUnit }
										id={ sizeFieldId }
										isRepeaterControl={ isRepeaterControl }
									/>
								</PropKeyProvider>
							</Grid>
						</>
					) }
				</Grid>
			</PropProvider>
		);
	}
);
