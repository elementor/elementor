import * as React from 'react';
import { useState } from 'react';
import { emailAdvancedPropTypeUtil } from '@elementor/editor-props';
import { Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { CollapsibleContent } from './collapsible-content';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { createControl } from '../create-control';
import { type ControlProps } from '../utils/types';
import { TextControl } from './text-control';

type Props = ControlProps< {
	label?: string;
} >;

export const EmailAdvancedSettingsControl = createControl( ( props: Props ) => {
	const { value, setValue, ...propContext } = useBoundProp( emailAdvancedPropTypeUtil );

	const { label = __( 'Advanced Settings', 'elementor' ) } = props || {};

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 1.5 }>
				<ControlLabel>{ label }</ControlLabel>

				<CollapsibleContent defaultOpen={ false }>
					<Stack gap={ 1.5 }>
						<PropKeyProvider bind="from-name">
							<Grid container direction="column" gap={ 0.5 }>
								<Grid item>
									<ControlFormLabel>{ __( 'From name', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item>
									<TextControl placeholder={ __( '....', 'elementor' ) } />
								</Grid>
							</Grid>
						</PropKeyProvider>

						<PropKeyProvider bind="reply-to">
							<Grid container direction="column" gap={ 0.5 }>
								<Grid item>
									<ControlFormLabel>{ __( 'Reply-to', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item>
									<TextControl placeholder={ __( '....', 'elementor' ) } />
								</Grid>
							</Grid>
						</PropKeyProvider>

						<PropKeyProvider bind="cc">
							<Grid container direction="column" gap={ 0.5 }>
								<Grid item>
									<ControlFormLabel>{ __( 'Cc', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item>
									<TextControl placeholder={ __( '....', 'elementor' ) } />
								</Grid>
							</Grid>
						</PropKeyProvider>

						<PropKeyProvider bind="bcc">
							<Grid container direction="column" gap={ 0.5 }>
								<Grid item>
									<ControlFormLabel>{ __( 'Bcc', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item>
									<TextControl placeholder={ __( '....', 'elementor' ) } />
								</Grid>
							</Grid>
						</PropKeyProvider>
					</Stack>
				</CollapsibleContent>
			</Stack>
		</PropProvider>
	);
} );
