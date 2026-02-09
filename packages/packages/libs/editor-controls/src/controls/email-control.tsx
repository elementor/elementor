import * as React from 'react';
import { emailPropTypeUtil } from '@elementor/editor-props';
import { Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { createControl } from '../create-control';
import { CollapsibleContent } from './collapsible-content';
import { TextAreaControl } from './text-area-control';
import { TextControl } from './text-control';

export const EmailControl = createControl( () => {
	const { value, setValue, ...propContext } = useBoundProp( emailPropTypeUtil );

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 1.5 }>
				<PropKeyProvider bind="to">
				<Grid container direction="column" gap={ 0.5 }>
					<Grid item>
						<ControlFormLabel>{ __( 'Send To', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item>
						<TextControl placeholder={ __( 'Where should we send new submissions?', 'elementor' ) } />
					</Grid>
				</Grid>
			</PropKeyProvider>

				<PropKeyProvider bind="subject">
					<Grid container direction="column" gap={ 0.5 }>
						<Grid item>
							<ControlFormLabel>{ __( 'Email Subject', 'elementor' ) }</ControlFormLabel>
						</Grid>
						<Grid item>
							<TextControl placeholder={ __( 'New form submission', 'elementor' ) } />
						</Grid>
					</Grid>
				</PropKeyProvider>

				<PropKeyProvider bind="message">
					<Grid container direction="column" gap={ 0.5 }>
						<Grid item>
							<ControlFormLabel>{ __( 'Message', 'elementor' ) }</ControlFormLabel>
						</Grid>
						<Grid item>
							<TextAreaControl
								placeholder={ __( 'By default, all form fields are sent via [all-fields] shortcode.', 'elementor' ) }
							/>
						</Grid>
					</Grid>
				</PropKeyProvider>

				<PropKeyProvider bind="from">
					<Grid container direction="column" gap={ 0.5 }>
						<Grid item>
							<ControlFormLabel>{ __( 'From email', 'elementor' ) }</ControlFormLabel>
						</Grid>
						<Grid item>
							<TextControl placeholder={ __( 'What email address should appear as the sender?', 'elementor' ) } />
						</Grid>
					</Grid>
				</PropKeyProvider>

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
