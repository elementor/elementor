import Document from '../../models/document';
import { Button, Card, CardBody, CardOverlay, CardHeader, CardImage, Heading } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

export default function OverviewContentGroupItem( props ) {
	const eventTracking = ( command, eventType = 'click' ) => {
		appsEventTrackingDispatch(
			command,
			{
				kit_name: props.kitTitle,
				document_type: props.groupData.id,
				document_name: `${ props.groupData.label }-${ props.document.title }`,
				page_source: 'overview',
				element_position: 'content_overview',
				event_type: eventType,
			},
		);
	};

	return (
		<Card>
			<CardHeader>
				<Heading
					tag="h3"
					title={ props.document.title }
					variant="h5"
					className="eps-card__headline"
				>
					{ props.document.title }
				</Heading>
			</CardHeader>
			<CardBody>
				<CardImage alt={ props.document.title } src={ props.document.thumbnailUrl || '' }>
					{ props.document.previewUrl && <CardOverlay>
						<Button
							className="e-kit-library__kit-item-overlay-overview-button"
							text={ __( 'View Demo', 'elementor' ) }
							icon="eicon-preview-medium"
							url={ `/kit-library/preview/${ props.kitId }?document_id=${ props.document.id }` }
							onClick={ () => eventTracking( 'kit-library/view-demo-part' ) }
						/>
					</CardOverlay> }
				</CardImage>
			</CardBody>
		</Card>
	);
}

OverviewContentGroupItem.propTypes = {
	document: PropTypes.instanceOf( Document ).isRequired,
	kitId: PropTypes.string.isRequired,
	kitTitle: PropTypes.string.isRequired,
	groupData: PropTypes.shape( {
		label: PropTypes.string,
		id: PropTypes.string,
	} ).isRequired,
};
