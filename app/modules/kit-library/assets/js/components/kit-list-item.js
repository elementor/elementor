import Badge from './badge';
import FavoritesActions from '../components/favorites-actions';
import Kit from '../models/kit';
import useKitCallToAction, { TYPE_PROMOTION } from '../hooks/use-kit-call-to-action';
import useAddKitPromotionUTM from '../hooks/use-add-kit-promotion-utm';
import { Card, CardHeader, CardBody, Heading, CardImage, CardOverlay, Grid, Button } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import { useSettingsContext } from '../context/settings-context';
import './kit-list-item.scss';

const KitListItem = ( props ) => {
	const [ type, { subscriptionPlan, badgeLabel } ] = useKitCallToAction( props.model.accessTier );
	const { settings } = useSettingsContext();
	const promotionUrl = useAddKitPromotionUTM( subscriptionPlan.promotion_url, props.model.id, props.model.title );
	const ctaText = settings.is_pro ? 'Upgrade' : `Go ${ subscriptionPlan?.label || '' }`;
	const showPromotion = TYPE_PROMOTION === type;

	const eventTracking = ( command ) => {
		appsEventTrackingDispatch(
			command,
			{
				kit_name: props.model.title,
				grid_location: props.index,
				search_term: props.queryParams,
				page_source: props.source && '/' === props.source ? 'all kits' : 'favorites',
			},
		);
	};

	return (
		<Card className="e-kit-library__kit-item">
			<CardHeader>
				<Heading
					tag="h3"
					title={ props.model.title }
					variant="h5"
					className="eps-card__headline"
				>
					{ props.model.title }
				</Heading>
				<FavoritesActions
					id={ props.model.id }
					isFavorite={ props.model.isFavorite }
					index={ props.index }
					name={ props.model.title }
					queryParams={ props.queryParams }
					source={ props.source }
				/>
			</CardHeader>
			<CardBody>
				<CardImage alt={ props.model.title } src={ props.model.thumbnailUrl || '' }>
					{
						showPromotion && (
							<Badge
								variant="sm"
								className="e-kit-library__kit-item-subscription-plan-badge"
								style={ { '--e-a-color-brand': subscriptionPlan.color } }
							>
								{ badgeLabel }
							</Badge>
						)
					}
					<CardOverlay>
						<Grid container direction="column" className="e-kit-library__kit-item-overlay">
							<Button
								className="e-kit-library__kit-item-overlay-overview-button"
								text={ __( 'View Demo', 'elementor' ) }
								icon="eicon-preview-medium"
								url={ `/kit-library/preview/${ props.model.id }` }
								onClick={ () => eventTracking( 'kit-library/check-out-kit' ) }
							/>
							{
								showPromotion && (
									<Button
										className="e-kit-library__kit-item-overlay-promotion-button"
										text={ ctaText }
										icon="eicon-external-link-square"
										url={ promotionUrl }
										target="_blank"
									/>
								)
							}
						</Grid>
					</CardOverlay>
				</CardImage>
			</CardBody>
		</Card>
	);
};

KitListItem.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
	index: PropTypes.number,
	queryParams: PropTypes.string,
	source: PropTypes.string,
};

export default React.memo( KitListItem );
