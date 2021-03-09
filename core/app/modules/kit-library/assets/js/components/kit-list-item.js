import { Card, CardHeader, CardBody, Heading, CardImage, CardOverlay, Grid, Button } from '@elementor/app-ui';
import Kit from '../models/kit';

import './kit-list-item.scss';

export default function KitListItem( props ) {
	return (
		<Card>
			<CardHeader>
				<Heading
					tag="h3"
					title={ props.model.title }
					variant="h5"
					className="eps-card__headline"
				>
					{ props.model.title }
				</Heading>
			</CardHeader>
			<CardBody>
				<CardImage alt={ props.model.title } src={ props.model.thumbnailUrl || '' }>
					<CardOverlay>
						<Grid container direction="column" className="e-kit-library__kit-item-overlay">
							<Button
								className="e-kit-library__kit-item-overlay-overview-button"
								text={ __( 'Overview', 'elementor' ) }
								icon="eicon-zoom-in-bold"
								url={ `/kit-library/${ props.model.id }` }
							/>
							<Button
								className="e-kit-library__kit-item-overlay-demo-button"
								text={ __( 'View Demo', 'elementor' ) }
								icon="eicon-preview-medium"
								url={ `/kit-library/${ props.model.id }/preview` }
							/>
						</Grid>
					</CardOverlay>
				</CardImage>
			</CardBody>
		</Card>
	);
}

KitListItem.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
};
