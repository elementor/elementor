import { useState } from 'react';
import useIntroduction from './use-introduction';

export default function useConfirmAction( {
	action,
	doNotShowAgainKey = null,
} ) {
	const {
		isViewed: shouldNotShowAgain,
		markAsViewed: markAsShouldNotShowAgain,
	} = useIntroduction( doNotShowAgainKey );

	const [
		dialogState,
		setDialogState,
	] = useState( {
		isOpen: false,
		actionArgs: [],
	} );

	const [
		doNotShowAgainCheckboxState,
		setDoNotShowAgainCheckboxState,
	] = useState( false );

	return {
		checkbox: {
			isChecked: doNotShowAgainCheckboxState,
			setIsChecked: setDoNotShowAgainCheckboxState,
		},
		dialog: {
			isOpen: dialogState.isOpen,
			approve: () => {
				action( ...dialogState.actionArgs );

				if ( doNotShowAgainCheckboxState && doNotShowAgainKey ) {
					markAsShouldNotShowAgain();
				}

				setDialogState( { isOpen: false, actionArgs: [] } );
			},
			dismiss: () => {
				setDialogState( { isOpen: false, actionArgs: [] } );
			},
		},
		runAction: ( ...actionArgs ) => {
			if ( shouldNotShowAgain ) {
				action( ...actionArgs );

				return;
			}

			setDialogState( { isOpen: true, actionArgs } );
		},
	};
}
