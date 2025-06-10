import { sprintf } from '@wordpress/i18n';
import { Dialog } from '@elementor/app-ui';
import PropTypes from 'prop-types';

export default function KitCloudDeleteDialog( {
	kit,
	show,
	onCancelClick,
	onDeleteClick,
	isLoading,
} ) {
	if ( ! kit || ! show ) {
		return null;
	}

	const handleDeleteClick = () => {
		if ( ! isLoading ) {
			onDeleteClick();
		}
	};

	const handleCancelClick = () => {
		if ( ! isLoading ) {
			onCancelClick();
		}
	};

	return (
		<Dialog
			title={ __( 'Delete this kit?', 'elementor' ) }
			// TODO: fix text
			text={ /* Translators: %s: Kit title. */ sprintf( __( 'Removing %s will permanently delete changes made to the site design and settings.', 'elementor' ), kit?.title || '' ) }
			onClose={ handleCancelClick }
			dismissButtonText={ __( 'Cancel', 'elementor' ) }
			dismissButtonOnClick={ handleCancelClick }
			approveButtonText={ isLoading ? '' : __( 'Delete', 'elementor' ) }
			approveButtonOnClick={ handleDeleteClick }
			approveButtonColor="danger"
		/>
	);
}

KitCloudDeleteDialog.propTypes = {
	onDeleteClick: PropTypes.func.isRequired,
	onCancelClick: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired,
	kit: PropTypes.shape( {
		id: PropTypes.string,
		title: PropTypes.string,
	} ),
};
