import { Card, CardHeader, CardBody, Heading, CardImage, CardOverlay, Grid, Button, Badge } from '@elementor/app-ui';
import Kit from '../models/kit';
import { useSettingsContext } from '../context/settings-context';

import './kit-list-item.scss';

const { useMemo } = React;

export default function KitListItem( props ) {
	const {
		settings: {
			access_level: accessLevel,
			subscription_plans: subscriptionPlans,
			is_library_connected: isLibraryConnected,
			is_pro: isPro,
		},
	} = useSettingsContext();

	const subscriptionPlan = useMemo( () => subscriptionPlans[ props.model.accessLevel ], [] );

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
					{
						subscriptionPlan?.label &&
							<Badge
								variant="sm"
								className="e-kit-library__kit-item-subscription-plan-badge"
								style={{ backgroundColor: subscriptionPlan.color }}
							>
								{ subscriptionPlan.label }
							</Badge>
					}
					<CardOverlay>
						<Grid container direction="column" className="e-kit-library__kit-item-overlay">
							<Button
								className="e-kit-library__kit-item-overlay-overview-button"
								text={ __( 'View Demo', 'elementor' ) }
								icon="eicon-preview-medium"
								url={ `/kit-library/preview/${ props.model.id }` }
							/>
							{
								( ( isPro && isLibraryConnected ) || ! isPro ) && accessLevel < props.model.accessLevel && <Button
									className="e-kit-library__kit-item-overlay-promotion-button"
									text={ __( 'Go %s', 'elementor' ).replace( '%s', subscriptionPlan.label ) }
									icon="eicon-external-link-square"
									url={ subscriptionPlan.promotion_url }
									target="_blank"
								/>
							}
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
