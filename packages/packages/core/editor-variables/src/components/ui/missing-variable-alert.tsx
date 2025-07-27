import * as React from 'react';
import { useSectionWidth } from '@elementor/editor-editing-panel';
import { Alert, AlertAction, AlertTitle, ClickAwayListener } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type MissingVariableAlertProps = {
	onClose: () => void;
	onClear?: () => void;
};

export const MissingVariableAlert = ( { onClose, onClear }: MissingVariableAlertProps ) => {
	const sectionWidth = useSectionWidth();

	return (
		<ClickAwayListener onClickAway={ onClose }>
			<Alert
				variant="standard"
				severity="warning"
				onClose={ onClose }
				action={
					<>
						{ onClear && (
							<AlertAction variant="contained" onClick={ onClear }>
								{ __( 'Clear', 'elementor' ) }
							</AlertAction>
						) }
					</>
				}
				sx={ { width: sectionWidth } }
			>
				<AlertTitle>{ __( 'This variable is missing', 'elementor' ) }</AlertTitle>
				{ __(
					'It may have been deleted. Try clearing this field and select a different value or variable.',
					'elementor'
				) }
			</Alert>
		</ClickAwayListener>
	);
};
