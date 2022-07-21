import Collapse from '../../components/collapse';
import ContentType from '../../models/content-type';
import FavoritesActions from '../../components/favorites-actions';
import Kit from '../../models/kit';
import OverviewTaxonomyBadge from './overview-taxonomy-badge';
import { Heading, CardImage, Text, Grid } from '@elementor/app-ui';
import {useEffect, useState} from 'react';

import './overview-sidebar.scss';

export default function OverviewSidebar( props ) {
	const [ isTagsCollapseOpen, setIsTagsCollapseOpen ] = useState( true );
	const [ isInformationCollapseOpen, setIsInformationCollapseOpen ] = useState( false );
	const sidebarTagFilterEvent = ( kitName, taxonomyText ) => {
		$e.run(
			'kit-library/sidebar-tag-filter',
			{
				kit_name: kitName,
				tag: taxonomyText,
			},
			{
				meta: {
					event: 'overview sidebar tag select',
					source: 'overview',
				},
			},
		);
	};
	const sidebarDropDownEvent = ( value, title ) => {
		const command = value ? 'kit-library/expand' : 'kit-library/collapse';
		$e.run(
			command,
			{
				section: title,
			},
			{
				meta: {
					action: command,
					event: 'sidebar section interaction',
					source: 'overview',
				},
			},
		);
	};

	//TODO: Shoots on first load
	useEffect( () => {
		sidebarDropDownEvent( isTagsCollapseOpen, 'tags' )
	}, [ isTagsCollapseOpen ] );

	useEffect( () => {
		sidebarDropDownEvent( isInformationCollapseOpen, 'what\'s inside' )
	}, [ isInformationCollapseOpen ] );

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
					index={ props.index }
					name={ props.model.title }
					source={ 'overview' }
				/>
			</div>
			<CardImage
				className="e-kit-library__item-sidebar-thumbnail"
				alt={ props.model.title }
				src={ props.model.thumbnailUrl || '' }
			/>
			<Text className="e-kit-library__item-sidebar-description">{ props.model.description || '' }</Text>
			{
				props.model.taxonomies.length > 0 &&
				<Collapse
					isOpen={ isTagsCollapseOpen }
					onChange={ setIsTagsCollapseOpen }
					title={ __( 'TAGS', 'elementor' ) }
					className="e-kit-library__item-sidebar-collapse-tags"
					pageId="overview"
					// sidebarDropDownEvent={ ( category ) => {
					// 	sidebarDropDownEvent( category, 'tags' )
					// } }
				>
					<Grid container className="e-kit-library__item-sidebar-tags-container">
						{ props.model.taxonomies.map( ( taxonomy ) => (
							<OverviewTaxonomyBadge key={ taxonomy } kitName={ props.model.title } sidebarTagFilterEvent={ ( taxonomyText ) => sidebarTagFilterEvent( props.model.title, taxonomyText ) }>{ taxonomy }</OverviewTaxonomyBadge>
						) ) }
					</Grid>
				</Collapse>
			}
			{
				props.groupedKitContent?.length > 0 && props.model.documents.length > 0 &&
				<Collapse
					isOpen={ isInformationCollapseOpen }
					onChange={ setIsInformationCollapseOpen }
					title={ __( 'WHAT\'S INSIDE', 'elementor' ) }
					className="e-kit-library__item-sidebar-collapse-info"
					pageId="overview"
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
	groupedKitContent: PropTypes.arrayOf(
		PropTypes.instanceOf( ContentType ),
	),
};
