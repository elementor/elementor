import { sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { ModalProvider, Button, Grid, Text } from '@elementor/app-ui';
import TextField from 'elementor-app/ui/atoms/text-field';

export default function KitCloudRenameDialog( {
	kit,
	show,
	setShow,
	isLoading,
	onCancelClick,
	onConfirmClick,
} ) {
	const [ title, setTitle ] = useState( '' );
	const [ error, setError ] = useState( null );

	const validateKitName = ( value ) => {
		if ( ! value || 0 === value.trim().length ) {
			return __( 'Must add a kit name', 'elementor' );
		}

		return null;
	};

	const handleChange = ( event ) => {
		setTitle( event.target.value );
	};

	const validateAndShowError = useCallback( ( value ) => {
		const validationError = validateKitName( value );
		setError( validationError );
		return validationError;
	}, [] );

	useEffect( () => {
		validateAndShowError( title );
	}, [ title, validateAndShowError ] );

	useEffect( () => {
		setTitle( kit?.title || '' );
	}, [ kit ] );

	return (
		<ModalProvider
			title={ /* Translators: %s: Kit title */ sprintf( __( 'Rename %s', 'elementor' ), kit?.title || '' ) }
			show={ show }
			setShow={ setShow }
			onClose={ onCancelClick }
		>
			<Grid container className="e-kit-library-actions_modal__content">
				<Grid container direction="column" item className="e-kit-library-actions_modal__content-header">
					<TextField
						placeholder={ __( 'Type kit name here...', 'elementor' ) }
						onChange={ handleChange }
						onBlur={ handleChange }
						value={ title }
						disabled={ isLoading }
					/>
					<div className="e-app-export-kit-information__error-container">
						{ error && (
							<Text variant="xs" className="e-kit-library-actions_modal__validation-error">
								{ error }
							</Text>
						) }
					</div>
				</Grid>
				<Grid container item justify="end" alignItems="center" className="e-kit-library-actions_modal__actions-container">
					<Button
						text={ __( 'Cancel', 'element' ) }
						color="link"
						variant="link"
						onClick={ () => ! isLoading && onCancelClick() }
					/>
					<Button
						text={ __( 'Ok', 'element' ) }
						color={ isLoading ? 'disabled' : 'primary' }
						variant="contained"
						onClick={ () => ! isLoading && onConfirmClick( { id: kit?.id, title } ) }
					/>
				</Grid>
			</Grid>
		</ModalProvider>
	);
}

KitCloudRenameDialog.propTypes = {
	onConfirmClick: PropTypes.func.isRequired,
	onCancelClick: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired,
	setShow: PropTypes.func.isRequired,
	kit: PropTypes.shape( {
		id: PropTypes.string,
		title: PropTypes.string,
	} ),
};
