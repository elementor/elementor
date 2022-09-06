import ModalProvider from 'elementor-app/ui/modal/modal';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

export default function KitInfoModal( props ) {
	return (
		<ModalProvider { ...props } className="e-app-export-kit-info-modal" title={ __( 'Website Kit Information', 'elementor' ) }>
			<ModalProvider.Section>
				<Heading className="e-app-export-kit-info-modal__heading" variant="h2" tag="h3">
					{ __( 'What is kit information?', 'elementor' ) }
				</Heading>
				<Text>
					{ __( 'These are the details you’ll use to quickly find and apply this kit in the future, even as your collection grows.', 'elementor' ) }
				</Text>
			</ModalProvider.Section>
		</ModalProvider>
	);
}
