import * as React from 'react';
import { emailPropTypeUtil } from '@elementor/editor-props';
import { Box, Divider, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { createControl } from '../create-control';
import { ChipsControl } from './chips-control';
import { CollapsibleContent } from '@elementor/editor-ui';
import { SelectControl } from './select-control';
import { TextAreaControl } from './text-area-control';
import { TextControl } from './text-control';

export const EmailControl = createControl( () => {
	const { value, setValue, ...propContext } = useBoundProp( emailPropTypeUtil );

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 2 }>
				<ControlFormLabel>{ __( 'Email settings', 'elementor' ) }</ControlFormLabel>
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
				<Box sx={ { pt: 2 } }>
					<Stack gap={ 2 }>
							<PropKeyProvider bind="from-name">
								<Grid container direction="column" gap={ 0.5 }>
									<Grid item>
										<ControlFormLabel>{ __( 'From name', 'elementor' ) }</ControlFormLabel>
									</Grid>
									<Grid item>
										<TextControl placeholder={ __( 'What name should appear as the sender?', 'elementor' ) } />
									</Grid>
								</Grid>
							</PropKeyProvider>

							<PropKeyProvider bind="reply-to">
								<Grid container direction="column" gap={ 0.5 }>
									<Grid item>
										<ControlFormLabel>{ __( 'Reply-to', 'elementor' ) }</ControlFormLabel>
									</Grid>
									<Grid item>
										<TextControl />
									</Grid>
								</Grid>
							</PropKeyProvider>

							<PropKeyProvider bind="cc">
								<Grid container direction="column" gap={ 0.5 }>
									<Grid item>
										<ControlFormLabel>{ __( 'Cc', 'elementor' ) }</ControlFormLabel>
									</Grid>
									<Grid item>
										<TextControl  />
									</Grid>
								</Grid>
							</PropKeyProvider>

							<PropKeyProvider bind="bcc">
								<Grid container direction="column" gap={ 0.5 }>
									<Grid item>
										<ControlFormLabel>{ __( 'Bcc', 'elementor' ) }</ControlFormLabel>
									</Grid>
									<Grid item>
										<TextControl placeholder={ __( '', 'elementor' ) } />
									</Grid>
								</Grid>
							</PropKeyProvider>

							<Divider />

							<PropKeyProvider bind="meta-data">
								<Stack gap={ 0.5 }>
									<ControlLabel>{ __( 'Meta data', 'elementor' ) }</ControlLabel>
									<ChipsControl
										options={ [
											{ label: __( 'Date', 'elementor' ), value: 'date' },
											{ label: __( 'Time', 'elementor' ), value: 'time' },
											{ label: __( 'Page URL', 'elementor' ), value: 'page-url' },
											{ label: __( 'User agent', 'elementor' ), value: 'user-agent' },
											{ label: __( 'Credit', 'elementor' ), value: 'credit' },
										] }
									/>
								</Stack>
							</PropKeyProvider>

							<PropKeyProvider bind="send-as">
								<Grid container direction="column" gap={ 0.5 }>
									<Grid item>
										<ControlFormLabel>{ __( 'Send as', 'elementor' ) }</ControlFormLabel>
									</Grid>
									<Grid item>
										<SelectControl
											options={ [
												{ label: __( 'HTML', 'elementor' ), value: 'html' },
												{ label: __( 'Plain Text', 'elementor' ), value: 'plain' },
											] }
										/>
									</Grid>
								</Grid>
							</PropKeyProvider>
						</Stack>
					</Box>
				</CollapsibleContent>
			</Stack>
		</PropProvider>
	);
} );
