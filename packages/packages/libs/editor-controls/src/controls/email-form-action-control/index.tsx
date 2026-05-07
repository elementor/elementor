import * as React from 'react';
import { emailsPropTypeUtil } from '@elementor/editor-props';
import { CollapsibleContent } from '@elementor/editor-ui';
import { Box, Divider, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlLabel } from '../../components/control-label';
import { createControl } from '../../create-control';
import {
	BccField,
	CcField,
	FromEmailField,
	FromNameField,
	MessageField,
	MetaDataField,
	ReplyToField,
	SendAsField,
	SendToField,
	SubjectField,
} from './fields';

export const EmailFormActionControl = createControl(
	( { toPlaceholder, label }: { toPlaceholder?: string; label?: string } ) => {
		const { value, setValue, ...propContext } = useBoundProp( emailsPropTypeUtil );

		return (
			<PropProvider { ...propContext } value={ value } setValue={ setValue }>
				<Stack gap={ 2 }>
					<ControlLabel>
						{ label ? label + ' ' + __( 'settings', 'elementor' ) : __( 'Email settings', 'elementor' ) }
					</ControlLabel>
					<PropKeyProvider bind="to">
						<SendToField placeholder={ toPlaceholder } />
					</PropKeyProvider>
					<SubjectField />
					<MessageField />
					<FromEmailField />
					<AdvancedSettings />
				</Stack>
			</PropProvider>
		);
	}
);

const AdvancedSettings = () => (
	<CollapsibleContent defaultOpen={ false }>
		<Box sx={ { pt: 2 } }>
			<Stack gap={ 2 }>
				<FromNameField />
				<ReplyToField />
				<CcField />
				<BccField />
				<Divider />
				<MetaDataField />
				<SendAsField />
			</Stack>
		</Box>
	</CollapsibleContent>
);
