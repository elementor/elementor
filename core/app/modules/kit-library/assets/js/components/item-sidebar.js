import { Heading, CardImage, Text, Collapse, Badge, Grid } from '@elementor/app-ui';
import Kit from '../models/kit';
import environment from 'elementor-common/utils/environment';
import ContentType from '../models/content-type';

import './item-sidebar.scss';

const { useState } = React;

export default function ItemSidebar( props ) {
	const [ isTagsCollapseOpen, setIsTagsCollapseOpen ] = useState( true );
	const [ isInformationCollapseOpen, setIsInformationCollapseOpen ] = useState( false );

	return (
		<div className="e-kit-library__item-sidebar">
			<Heading
				tag="h1"
				variant="h5"
				className="e-kit-library__item-sidebar-header">
				{ props.model.title }
			</Heading>
			<CardImage
				className="e-kit-library__item-sidebar-thumbnail"
				alt={ props.model.title }
				src={ props.model.thumbnailUrl || '' }
			/>
			<Text className="e-kit-library__item-sidebar-description">{ props.model.description || '' }</Text>
			{
				props.model.tags.length > 0 &&
				<Collapse
					isOpen={ isTagsCollapseOpen }
					onChange={ setIsTagsCollapseOpen }
					title={ __( 'TAGS', 'elementor' ) }
					className="e-kit-library__item-sidebar-collapse"
				>
					<Grid container className="e-kit-library__item-sidebar-tags-container">
						{ props.model.tags.map( ( tag ) => (
							<Badge
								key={ tag }
								className={ environment.safari ? 'e-kit-library__item-sidebar-tag--safari-support' : '' }
							>
								{ tag }
							</Badge>
						) ) }
					</Grid>
				</Collapse>
			}
			{
				props.groupedKitContent?.length > 0 && props.model.documents.length > 0 &&
				<Collapse
					isOpen={ isInformationCollapseOpen }
					onChange={ setIsInformationCollapseOpen }
					title={ __( 'INFORMATION', 'elementor' ) }
					className="e-kit-library__item-sidebar-collapse"
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

ItemSidebar.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
	groupedKitContent: PropTypes.arrayOf(
		PropTypes.instanceOf( ContentType )
	),
};
