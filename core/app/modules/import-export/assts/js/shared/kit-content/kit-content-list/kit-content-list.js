import { useState } from 'react';

import List from '../../../ui/list/list';
import Box from '../../../ui/box/box';
import PostTypesSelect from './post-types-select/post-types-select';
import TemplatesFeatures from './templates-features/templates-features';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Button from 'elementor-app/ui/molecules/button';

import kitContentData from '../kit-content-data/kit-content-data';

import './kit-content-list.scss';

export default function KitContentList( props ) {
	const [ postsList, setPostsList ] = useState( [ __( 'Select custom post types (maximum of 20 posts will be included)', 'elementor' ) ] ),
	getButton = () => (
		<Grid item>
			<Button variant="contained" color="cta" text={ __( 'Lear More', 'elementor' ) } url="/#" />
		</Grid>
	),
	getNotice = ( notice ) => (
		<Box variant="notice" className="kit-content-list__notice">
			<Text variant="xs">
				{ notice }
			</Text>
		</Box>
	),
	getProFeaturesIndication = () => (
		<Text variant="md" tag="span" color="cta" className="kit-content-list__pro-indication">
			<strong>{ __( 'Pro Features', 'elementor' ) }</strong>
		</Text>
	),
	setIncludes	= ( event, includeType ) => {
		const action = event.target.checked ? 'add' : 'remove';

		props.setIncludes( includeType, action );
	};

	return (
		<List separated className="kit-content-list">
			{
				kitContentData.map( ( item, index ) => (
					<List.Item key={ index } className="kit-content-list__item">
						<Grid container justify="space-between" alignItems="center">
							<Grid item container={ ! item.data.notice }>
								<Grid container item>
									<Checkbox onChange={ ( event ) => setIncludes( event, item.type ) } className="kit-content-list__checkbox" />

									<Grid item>
										<Heading variant="h3" className="kit-content-list__title">{ item.data.title }</Heading>

										<Grid item>
											<Text variant="sm" tag="span" className="kit-content-list__description">
												{ item.data.description || ( item.data.features && <TemplatesFeatures features={ item.data.features } /> ) }
											</Text>

											{ item.data.notice && getProFeaturesIndication() }
										</Grid>
									</Grid>
								</Grid>

								{ item.data.notice && getNotice( item.data.notice ) }
								{ ( 'content' === item.type && 'export' === props.type ) ? <PostTypesSelect options={ postsList }/> : null }
							</Grid>

							{ item.data.notice && getButton() }
						</Grid>
					</List.Item>
				) )
			}
		</List>
	);
}

KitContentList.propTypes = {
	classname: PropTypes.string,
	type: PropTypes.string.isRequired,
	setIncludes: PropTypes.func,
};

KitContentList.defaultProps = {
	className: '',
};
