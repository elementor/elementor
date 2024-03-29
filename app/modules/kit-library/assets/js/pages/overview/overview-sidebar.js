import Collapse from '../../components/collapse';
import ContentType from '../../models/content-type';
import FavoritesActions from '../../components/favorites-actions';
import Kit from '../../models/kit';
import { Heading, CardImage, Text } from '@elementor/app-ui';
import { useState } from 'react';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './overview-sidebar.scss';

export default function OverviewSidebar( props ) {
	const [ isInformationCollapseOpen, setIsInformationCollapseOpen ] = useState( true );
	const eventTracking = ( command, section = null, kitName = null, tag = null, isCollapsed = null, eventType = 'click' ) => {
		const action = isCollapsed && isCollapsed ? 'collapse' : 'expand';
		if ( 'boolean' === typeof isCollapsed ) {
			command = `kit-library/${ action }`;
		}
		appsEventTrackingDispatch(
			command,
			{
				page_source: 'overview',
				element_location: 'app_sidebar',
				kit_name: kitName,
				tag,
				section,
				event_type: eventType,
			},
		);
	};

	return (
		<div className="e-kit-library__item-sidebar">
			<div className="e-kit-library__item-sidebar-header">
				<Heading
					tag="h1"
					variant="h5"
					className="e-kit-library__item-sidebar-header-title">
					{ props.model.title }
				</Heading>
				<FavoritesActions
					isFavorite={ props.model.isFavorite }
					id={ props.model.id }
				/>
			</div>
			<CardImage
				className="e-kit-library__item-sidebar-thumbnail"
				alt={ props.model.title }
				src={ props.model.thumbnailUrl || '' }
			/>
			<Text className="e-kit-library__item-sidebar-description">{ props.model.description || '' }</Text>
			{
				props.groupedKitContent?.length > 0 && props.model.documents.length > 0 &&
				<Collapse
					isOpen={ isInformationCollapseOpen }
					onChange={ setIsInformationCollapseOpen }
					title={ __( 'WHAT\'S INSIDE', 'elementor' ) }
					className="e-kit-library__item-sidebar-collapse-info"
					onClick={ ( collapseState, title ) => {
						eventTracking( null, title, null, null, collapseState );
					} }
				>
					{
						props.groupedKitContent.map( ( contentType ) => {
							if ( contentType.documents <= 0 ) {
								return '';
							}

							return (
								<Text className="e-kit-library__item-information-text" key={ contentType.id }>
									{ contentType.documents.length } { contentType.label }
								</Text>
							);
						} )
					}
				</Collapse>
			}
		</div>
	);
}

OverviewSidebar.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
	index: PropTypes.number,
	groupedKitContent: PropTypes.arrayOf(
		PropTypes.instanceOf( ContentType ),
	),
};
