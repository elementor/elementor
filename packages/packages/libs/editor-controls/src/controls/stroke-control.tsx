import * as React from 'react';
import { forwardRef, useRef } from 'react';
import { strokePropTypeUtil } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { SectionContent } from '../components/section-content';
import { createControl } from '../create-control';
import { type LengthUnit } from '../utils/size-control';
import { ColorControl } from './color-control';
import { SizeControl } from './size-control';

type StrokeProps = {
	bind: string;
	label: string;
	children: React.ReactNode;
};

const units: LengthUnit[] = [ 'px', 'em', 'rem' ];

export const StrokeControl = createControl( () => {
	const propContext = useBoundProp( strokePropTypeUtil );
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<PropProvider { ...propContext }>
			<SectionContent>
				<Control bind="width" label={ __( 'Stroke width', 'elementor' ) } ref={ rowRef }>
					<SizeControl units={ units } anchorRef={ rowRef } />
				</Control>
				<Control bind="color" label={ __( 'Stroke color', 'elementor' ) }>
					<ColorControl />
				</Control>
			</SectionContent>
		</PropProvider>
	);
} );

const Control = forwardRef( ( { bind, label, children }: StrokeProps, ref ) => (
	<PropKeyProvider bind={ bind }>
		<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap" ref={ ref }>
			<Grid item xs={ 6 }>
				<ControlFormLabel>{ label }</ControlFormLabel>
			</Grid>
			<Grid item xs={ 6 }>
				{ children }
			</Grid>
		</Grid>
	</PropKeyProvider>
) );
