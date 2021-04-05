import { useNavigate } from '@reach/router';
import { Dialog, Text } from '@elementor/app-ui';
import { useSettingsContext } from '../../context/settings-context';
import Header from './header';
import HeaderBackButton from './header-back-button';
import HeaderButtons from './header-buttons';
import Kit from '../../models/kit';

const { useMemo, useState } = React;

export default function ItemHeader( props ) {
	const navigate = useNavigate();
	const { isLibraryConnected, libraryConnectUrl } = useSettingsContext();
	const [ isConnectDialogOpen, setIsConnectDialogOpen ] = useState( false );
	const [ isImportDialogOpen, setIsImportDialogOpen ] = useState( false );

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
	], [ props.buttons ] );

	return (
		<>
			{
				isConnectDialogOpen && <Dialog
					title={ __( 'Connect to Template Library', 'elementor' ) }
					text={ __( 'Access this template and our entire library by creating an account', 'elementor' ) }
					approveButtonText={ __( 'Get Started', 'elementor' ) }
					approveButtonOnClick={ () => {
						const tab = window.open(
							libraryConnectUrl,
							'_blank',
						);

						setIsConnectDialogOpen( false );
					} }
					approveButtonColor="primary"
					dismissButtonText={ __( 'Cancel', 'elementor-pro' ) }
					dismissButtonOnClick={ () => setIsConnectDialogOpen( false ) }
					onClose={ () => setIsConnectDialogOpen( false ) }
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
