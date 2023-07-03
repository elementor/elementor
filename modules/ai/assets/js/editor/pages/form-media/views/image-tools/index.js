import View from '../../components/view';
import ImageToolsPanel from './image-tools-panel';
import ImageToolsContent from './image-tools-content';
import { useLocation } from '../../context/location-context';
import { LOCATIONS } from '../../constants';

const ImageTools = () => {
	const { navigate } = useLocation();

	return (
		<View>
			<View.Panel>
				<View.BackButton onClick={ () => navigate( LOCATIONS.GENERATE ) }>
					{ __( 'Generate with a prompt', 'elementor' ) }
				</View.BackButton>

				<View.PanelHeading primary={ __( 'Edit with AI', 'elementor' ) } />

				<ImageToolsPanel />
			</View.Panel>

			<View.Content>
				<ImageToolsContent />
			</View.Content>
		</View>
	);
};

export default ImageTools;
