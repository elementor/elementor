import { useState, memo } from 'react';

import List from '../../../ui/list/list';
import PostTypesSelect from './post-types-select/post-types-select';
import TemplatesFeatures from './templates-features/templates-features';
import Notice from '../../../ui/notice/notice';
import KitContentCheckbox from './kit-content-checkbox/kit-content-checkbox';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

import kitContentData from '../kit-content-data/kit-content-data';

import './kit-content-list.scss';

function KitContentList( props ) {
	const getButton = () => (
		<Grid item>
			<Button variant="contained" color="cta" text={ __( 'Lear More', 'elementor' ) } url="/#" />
		</Grid>
	),
	getNotice = ( notice ) => (
		<Notice color="warning" className="kit-content-list__notice">
			<Text variant="xs">
				{ notice }
			</Text>
		</Notice>
	),
	getProFeaturesIndication = () => (
		<Text variant="md" tag="span" color="cta" className="kit-content-list__pro-indication">
			<strong data-value={ Math.random() }>{ __( 'Pro Features', 'elementor' ) }</strong>
		</Text>
	);

	console.log( '--- RENDER: KitContentList()' );

	return (
		<List separated className="kit-content-list">
			{
				kitContentData.map( ( item, index ) => (
					<List.Item key={ index } className="kit-content-list__item">
						<Grid container justify="space-between" alignItems="center">
							<Grid item container={ item.hasSelect }>
								<Grid item container>
									<KitContentCheckbox type={ item.type } className="kit-content-list__checkbox" />

									<Grid item className={ 'content' === item.type ? ' kit-content-list-grid--expand' : '' }>
										<Heading variant="h3" className="kit-content-list__title">{ item.data.title }</Heading>

										<Grid item>
											<Text variant="sm" tag="span" className="kit-content-list__description">
												{ item.data.description || ( item.data.features && <TemplatesFeatures features={ item.data.features } /> ) }
											</Text>

											{ item.data.notice && getProFeaturesIndication() }

											{ ( item.hasSelect && 'export' === props.type ) ? <PostTypesSelect itemType={ item.type } /> : null }
										</Grid>
									</Grid>
								</Grid>
							</Grid>

							{ item.data.notice && getButton() }
						</Grid>

						{ item.data.notice && getNotice( item.data.notice ) }
					</List.Item>
				) )
			}
		</List>
	);
}

KitContentList.propTypes = {
	className: PropTypes.string,
	type: PropTypes.string.isRequired,
};

KitContentList.defaultProps = {
	className: '',
};

export default memo( KitContentList, () => true );
