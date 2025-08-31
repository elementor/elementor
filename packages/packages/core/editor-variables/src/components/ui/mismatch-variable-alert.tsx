import * as React from 'react';
import { useSectionWidth } from '@elementor/editor-editing-panel';
import { Alert, AlertAction, AlertTitle, ClickAwayListener } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type AlertProps = {
	onClose: () => void;
	onClear?: () => void;
	triggerSelect?: () => void;
};

const i18n = {
	title: __( 'Variable has changed', 'elementor' ),
	message: __(
		`This variable is no longer compatible with this property. You can clear it or select a different one.`,
		'elementor'
	),
	buttons: {
		clear: __( 'Clear', 'elementor' ),
		select: __( 'Select variable', 'elementor' ),
	},
};

export const MismatchVariableAlert = ( { onClose, onClear, triggerSelect }: AlertProps ) => {
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
								{ i18n.buttons.clear }
							</AlertAction>
						) }
						{ triggerSelect && (
							<AlertAction variant="outlined" onClick={ triggerSelect }>
								{ i18n.buttons.select }
							</AlertAction>
						) }
					</>
				}
				sx={ {
					width: sectionWidth,
					minWidth: 300,
				} }
			>
				<AlertTitle>{ i18n.title }</AlertTitle>
				{ i18n.message }
			</Alert>
		</ClickAwayListener>
	);
};
