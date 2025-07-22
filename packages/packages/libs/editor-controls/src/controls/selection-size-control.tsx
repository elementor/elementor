import * as React from 'react';
import { useRef } from 'react';
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
};

export const SelectionSizeControl = createControl(
	( { selectionLabel, sizeLabel, selectionConfig, sizeConfigMap }: SelectionSizeControlProps ) => {
		const { value, setValue, propType } = useBoundProp( selectionSizePropTypeUtil );
		const rowRef = useRef< HTMLDivElement >( null );

		const currentSizeConfig = sizeConfigMap[ value?.selection?.value || '' ];
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
								<ControlFormLabel>{ sizeLabel }</ControlFormLabel>
							</Grid>
							<Grid item xs={ 6 }>
								<PropKeyProvider bind="size">
									<SizeControl
										anchorRef={ rowRef }
										variant={ currentSizeConfig.variant }
										units={ currentSizeConfig.units }
										defaultUnit={ currentSizeConfig.defaultUnit }
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
