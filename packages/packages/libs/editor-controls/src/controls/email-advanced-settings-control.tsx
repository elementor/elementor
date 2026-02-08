import * as React from 'react';
import { useState } from 'react';
import { emailAdvancedPropTypeUtil } from '@elementor/editor-props';
import { MinusIcon, PlusIcon } from '@elementor/icons';
import { Collapse, Grid, IconButton, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { createControl } from '../create-control';
import { type ControlProps } from '../utils/types';
import { TextControl } from './text-control';

const SIZE = 'tiny';

type Props = ControlProps< {
	label?: string;
} >;

export const EmailAdvancedSettingsControl = createControl( ( props: Props ) => {
	const { value, path, setValue, ...propContext } = useBoundProp( emailAdvancedPropTypeUtil );
	const [ isActive, setIsActive ] = useState( false );

	const {
		label = __( 'Advanced Settings', 'elementor' ),
	} = props || {};

	const onEnabledChange = () => {
		setIsActive( ! isActive );
	};

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 1.5 }>
				<Stack
					direction="row"
					sx={ {
						justifyContent: 'space-between',
						alignItems: 'center',
						marginInlineEnd: -0.75,
					} }
				>
					<ControlLabel>{ label }</ControlLabel>
					<ToggleIconControl
						active={ isActive }
						onIconClick={ onEnabledChange }
						label={ __( 'Toggle advanced settings', 'elementor' ) }
					/>
				</Stack>
				<Collapse in={ isActive } timeout="auto" unmountOnExit>
					<Stack gap={ 1.5 }>
						<PropKeyProvider bind={ 'from-name' }>
							<Grid container direction="column" gap={ 0.5 }>
								<Grid item>
									<ControlFormLabel>{ __( 'From name', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item>
									<TextControl
										placeholder={ __( '....', 'elementor' ) }
									/>
								</Grid>
							</Grid>
						</PropKeyProvider>
						<PropKeyProvider bind={ 'reply-to' }>
							<Grid container direction="column" gap={ 0.5 }>
								<Grid item>
									<ControlFormLabel>{ __( 'Reply-to', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item>
									<TextControl
										placeholder={ __( '....', 'elementor' ) }
									/>
								</Grid>
							</Grid>
						</PropKeyProvider>
						<PropKeyProvider bind={ 'cc' }>
							<Grid container direction="column" gap={ 0.5 }>
								<Grid item>
									<ControlFormLabel>{ __( 'Cc', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item>
									<TextControl
										placeholder={ __( '....', 'elementor' ) }
									/>
								</Grid>
							</Grid>
						</PropKeyProvider>
						<PropKeyProvider bind={ 'bcc' }>
							<Grid container direction="column" gap={ 0.5 }>
								<Grid item>
									<ControlFormLabel>{ __( 'Bcc', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item>
									<TextControl
										placeholder={ __( '....', 'elementor' ) }
									/>
								</Grid>
							</Grid>
						</PropKeyProvider>
					</Stack>
				</Collapse>
			</Stack>
		</PropProvider>
	);
} );

type ToggleIconControlProps = {
	active: boolean;
	onIconClick: () => void;
	label?: string;
};

const ToggleIconControl = ( { active, onIconClick, label }: ToggleIconControlProps ) => {
	return (
		<IconButton size={ SIZE } onClick={ onIconClick } aria-label={ label }>
			{ active ? <MinusIcon fontSize={ SIZE } /> : <PlusIcon fontSize={ SIZE } /> }
		</IconButton>
	);
};
