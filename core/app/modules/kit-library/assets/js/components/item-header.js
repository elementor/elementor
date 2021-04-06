import { useNavigate } from '@reach/router';
import { Dialog, Text } from '@elementor/app-ui';
import { useSettingsContext } from '../context/settings-context';
import Header from './layout/header';
import HeaderBackButton from './layout/header-back-button';
import HeaderButtons from './layout/header-buttons';
import Kit from '../models/kit';
import ConnectDialog from './connect-dialog';

const { useMemo, useState } = React;

export default function ItemHeader( props ) {
	const navigate = useNavigate();
	const {
		settings: { is_library_connected: isLibraryConnected },
		updateSettings,
	} = useSettingsContext();

	const [ isConnectDialogOpen, setIsConnectDialogOpen ] = useState( false );
	const [ isImportDialogOpen, setIsImportDialogOpen ] = useState( false );
	const [ error, setError ] = useState( false );

	const buttons = useMemo( () => [
		{
			id: 'apply-kit',
			text: __( 'Apply Kit', 'elementor' ),
			hideText: false,
			variant: 'contained',
			color: 'primary',
			size: 'sm',
			onClick: () => {
				if ( ! isLibraryConnected ) {
					setIsConnectDialogOpen( true );

					return;
				}

				setIsImportDialogOpen( true );
			},
		},
		...props.buttons,
	], [ props.buttons, isLibraryConnected ] );

	return (
		<>
			{
				error && <Dialog
					title={ error }
					approveButtonText={ __( 'Learn More', 'elementor-pro' ) }
					approveButtonColor="link"
					approveButtonUrl="#"
					approveButtonOnClick={ () => setError( false ) }
					dismissButtonText={ __( 'Close', 'elementor-pro' ) }
					dismissButtonOnClick={ () => setError( false ) }
					onClose={ () => setError( false ) }
				/>
			}
			{
				isConnectDialogOpen && <ConnectDialog
					onClose={ () => setIsConnectDialogOpen( false ) }
					onSuccess={ () => {
						updateSettings( { is_library_connected: true } );
						setIsImportDialogOpen( true );
					} }
					onError={ ( message ) => setError( message ) }
				/>
			}
			{
				isImportDialogOpen && <Dialog
					title={ __( 'Apply %s?', 'elementor' ).replace( '%s', props.model.title ) }
					approveButtonText={ __( 'Apply All', 'elementor' ) }
					approveButtonOnClick={ () => {
						navigate( '/import' );
					} }
					approveButtonColor="primary"
					dismissButtonText={ __( 'Customize', 'elementor-pro' ) }
					dismissButtonOnClick={ () => {
						navigate( '/import' );
					} }
					onClose={ () => setIsImportDialogOpen( false ) }
				>
					<Text>
						{ __( 'You can use everything in this kit, or Customize to only include some items.', 'elementor' ) }
					</Text>
					<Text>
						{ __( 'By applying the entire kit, you\'ll override any styles, settings or content already on your site.', 'elementor' ) }
					</Text>
				</Dialog>
			}
			<Header
				startSlot={ <HeaderBackButton/> }
				centerSlot={ props.centerSlot }
				endSlot={ <HeaderButtons buttons={ buttons }/> }
			/>
		</>
	);
}

ItemHeader.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
	centerSlot: PropTypes.node,
	buttons: PropTypes.arrayOf( PropTypes.object ),
};
