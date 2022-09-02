import InlineLink from 'elementor-app/ui/molecules/inline-link';
import InfoModal from './info-modal';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

export default function ImportInfoModal( props ) {
	const eventTracking = ( element ) => appsEventTrackingDispatch(
		'kit-library/seek-more-info',
		{
			page_source: 'import',
			modal_type: 'info',
			event_type: 'click',
			element,
		},
	);
	return (
		<InfoModal { ...props } title={ __( 'Import a Website Kit', 'elementor' ) }>
			<InfoModal.Section>
				<InfoModal.Heading>{ __( 'What’s a Website Kit?', 'elementor' ) }</InfoModal.Heading>
				<InfoModal.Text>
					<>
						{ __( 'A Website Kit is a .zip file that contains all the parts of a complete site. It’s an easy way to get a site up and running quickly.', 'elementor' ) }
						<br /><br />
						<InlineLink
							url="https://go.elementor.com/app-what-are-kits"
							onClick={ () => eventTracking( 'Learn more about website kits' ) }
						>
							{ __( ' Learn more about Website Kits', 'elementor' ) }
						</InlineLink>
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
							onClick={ () => eventTracking( 'learn more' ) }
						>
							{ __( 'Learn More', 'elementor' ) }
						</InlineLink>
					</>
				</InfoModal.Text>
			</InfoModal.Section>
		</InfoModal>
	);
}
