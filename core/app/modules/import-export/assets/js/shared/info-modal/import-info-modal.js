import InlineLink from 'elementor-app/ui/molecules/inline-link';
import InfoModal from './info-modal';
import { eventTrackingObject } from 'elementor-app/consts/consts';

export default function ImportInfoModal( props ) {
	function eventTrack( trackName, event ) {
		const eventParams = {
			...eventTrackingObject,
			placement: 'kit library',
			event,
			details: {
				...eventTrackingObject.details,
				source: 'import',
			},
		};

		$e.run( trackName, eventParams );
	}

	return (
		<InfoModal { ...props } title={ __( 'Import a Template Kit', 'elementor' ) }>
			<InfoModal.Section>
				<InfoModal.Heading>{ __( 'What’s a Template Kit?', 'elementor' ) }</InfoModal.Heading>
				<InfoModal.Text>
					<>
						{ __( 'A Template Kit is a .zip file that contains all the parts of a complete site. It’s an easy way to get a site up and running quickly.', 'elementor' ) }
						<br /><br />
						<InlineLink
							url="https://go.elementor.com/app-what-are-kits"
							eventTrack={ eventTrack }
							trackingParams={ { trackName: 'kit-library/seek-more-info', event: 'info modal learn more-kits' } }
						>{ __( ' Learn more about Template Kits', 'elementor' ) }</InlineLink>
					</>
				</InfoModal.Text>
			</InfoModal.Section>

			<InfoModal.Section>
				<InfoModal.Heading>{ __( 'How does importing work?', 'elementor' ) }</InfoModal.Heading>
				<InfoModal.Text>
					<>
						{ __( 'Start by uploading the file and selecting the parts and plugins you want to apply. If there are any overlaps between the kit and your current design, you’ll be able to choose which imported parts you want to apply or ignore. Once the file is ready, the kit will be applied to your site and you’ll be able to see it live.', 'elementor' ) }
						<br /><br />
						<InlineLink
							url="http://go.elementor.com/app-import-kit"
							eventTrack={ eventTrack }
							trackingParams={ { trackName: 'kit-library/seek-more-info', event: 'info modal learn more-kits' } }
						>
							{ __( 'Learn More', 'elementor' ) }
						</InlineLink>
					</>
				</InfoModal.Text>
			</InfoModal.Section>
		</InfoModal>
	);
}
