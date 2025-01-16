import { useEffect, useState, useReducer } from 'react';
import { LocationProvider } from './context/location-context';
import { Divider } from '@elementor/ui';
import PropTypes from 'prop-types';
import PromptDialog from '../../components/prompt-dialog';
import MediaOutlet from './media-outlet';
import UnsavedChangesAlert from './components/unsaved-changes-alert';
import { EditImageProvider } from './context/edit-image-context';
import { GlobalActionsProvider } from './context/global-actions-context';
import { GlobalSettingsProvider } from './context/global-settings-context';
import PromptHistory from '../../components/prompt-history';

const initialData = {
	isAllSaved: false,
	hasUnsavedChanges: false,
};

const SET_UNSAVED_CHANGES = 'SET_UNSAVED_CHANGES';
const SAVE_AND_CLOSE = 'SAVE_AND_CLOSE';

const reducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case SET_UNSAVED_CHANGES:
			return {
				...state,
				hasUnsavedChanges: payload,
				isAllSaved: payload ? false : state.isAllSaved,
			};
		case SAVE_AND_CLOSE:
			return {
				...state,
				isAllSaved: true,
				hasUnsavedChanges: false,
			};
		default:
			throw Error( 'Unknown action.' );
	}
};

const FormMedia = ( {
	onClose,
	DialogProps,
	getControlValue,
	setControlValue,
	additionalOptions,
	maybeRenderUpgradeChip,
	hasSubscription,
	usagePercentage,
} ) => {
	const [ state, dispatch ] = useReducer( reducer, initialData );

	const [ showUnsavedChangeAlert, setShowUnsavedChangeAlert ] = useState( false );

	const setHasUnsavedChanges = ( payload ) => dispatch( { type: SET_UNSAVED_CHANGES, payload } );

	const saveAndClose = () => dispatch( { type: SAVE_AND_CLOSE } );

	const onCloseIntent = () => {
		if ( state.hasUnsavedChanges ) {
			setShowUnsavedChangeAlert( true );
			return;
		}

		onClose();
	};

	const editImageInitialData = getControlValue() === additionalOptions?.defaultValue ? {} : getControlValue();

	const globalSettings = {
		initialImageType: additionalOptions?.defaultImageType || '',
		hasSubscription,
		usagePercentage,
	};

	const globalActions = {
		state,
		getControlValue,
		setControlValue,
		saveAndClose,
		close: onCloseIntent,
		setHasUnsavedChanges,
	};

	useEffect( () => {
		if ( state.isAllSaved ) {
			// Closing the app only once the state was updated, to allow registered effects to take place before closing.
			onClose();
		}
	}, [ state.isAllSaved ] );

	return (
		<>
			<PromptDialog id="e-form-media" onClose={ () => onCloseIntent() } maxWidth="lg" { ...DialogProps }>
				<PromptDialog.Header onClose={ () => onCloseIntent() }>
					{ ! additionalOptions.withoutHistory && <PromptHistory /> }

					{ maybeRenderUpgradeChip() }
				</PromptDialog.Header>

				<Divider />

				<GlobalSettingsProvider settings={ globalSettings }>
					<GlobalActionsProvider actions={ globalActions }>
						<LocationProvider>
							<EditImageProvider imageData={ editImageInitialData }>
								<MediaOutlet additionalOptions={ additionalOptions } onClose={ onClose } />
							</EditImageProvider>
						</LocationProvider>
					</GlobalActionsProvider>
				</GlobalSettingsProvider>
			</PromptDialog>

			{
				showUnsavedChangeAlert && (
					<UnsavedChangesAlert onClose={ onClose } onCancel={ () => setShowUnsavedChangeAlert( false ) } open={ true } />
				)
			}
		</>
	);
};

FormMedia.propTypes = {
	onClose: PropTypes.func.isRequired,
	DialogProps: PropTypes.object,
	getControlValue: PropTypes.func.isRequired,
	setControlValue: PropTypes.func.isRequired,
	additionalOptions: PropTypes.object,
	credits: PropTypes.number,
	maybeRenderUpgradeChip: PropTypes.func,
	hasSubscription: PropTypes.bool,
	usagePercentage: PropTypes.number,
};

export default FormMedia;
