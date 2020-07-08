import { useState, useEffect } from 'react';

import List from '../../ui/list/list';
import Text from '../../ui/text/text';
import Box from '../../ui/box/box';
import KitContentSelect from './kit-content-select/kit-content-select';
import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Button from 'elementor-app/ui/molecules/button';

import './kit-content-list.scss';

export default function KitContentList( props ) {
	const [ postsList, setPostsList ] = useState( [ __( 'Select custom post types (maximum of 20 posts will be included)', 'elementor' ) ] );
	const exportContent = [
		{
			type: 'templates',
			data: {
				title: __( 'Global Templates', 'elementor' ),
				features: {
					open: [
						__( 'Saved Templates', 'elementor' ),
					],
					locked: [
						__( 'Site Parts', 'elementor' ),
						__( 'Popups', 'elementor' ),
						__( 'Global Widgets', 'elementor' ),
					],
				},
				notice: 'Site Parts, Global widgets and Popups will are available only when Elementor Pro license is Connected',
			},
		},
		{
			type: 'styles',
			data: {
				title: __( 'Global Styles And Settings', 'elementor' ),
				description: __( 'Theme Style, Global Colors and Typography, Layout, Lightbox and Site Identity settings', 'elementor' ),
			},
		},
		{
			type: 'content',
			data: {
				title: __( 'Content', 'elementor' ),
				description: __( 'Published pages, posts, related taxonomies, menu and custom post types.', 'elementor' ),
				contentSelection: postsList,
			},
		},
	],
	getButton = () => (
		<Grid item>
			<Button variant="cta" text={ __( 'Lear More', 'elementor' ) } url="/#" />
		</Grid>
	),
	getNotice = ( notice ) => (
		<Box type="notice">
			<Text size="sm">
				{ notice }
			</Text>
		</Box>
	),
	getProFeaturesIndication = () => (
		<Text size="md" tag="span" color="cta" className="kit-content-list__pro-indication">
			<strong>{ __( 'Pro Features', 'elementor' ) }</strong>
		</Text>
	),
	getFeatures = ( features ) => {
		const lockedFeatures = features.locked?.length ? <span className="kit-content-list__locked-features">{ features.locked.join( ', ' ) }</span> : null;
		let openFeatures = features.open?.join( ', ' );

		if ( openFeatures && lockedFeatures ) {
			openFeatures += ', ';
		}

		return (
			<>
				{ openFeatures }
				{ lockedFeatures }
			</>
		);
	},
	getContentSelection = ( item ) => {
		if ( 'content' !== item.type || 'export' !== props.type ) {
			return;
		}

		return (
			<Grid container justify="center" className="kit-content-selection-container">
				<KitContentSelect options={ item.data.contentSelection } />
			</Grid>
		);
	};

	const getApiData = () => {
		return new Promise( ( res ) => {
			setTimeout( () => {
				const posts = [
					'post 1',
					'post 2',
					'post 3',
				];

				res( posts );
			}, 2000 );
		} );
	};

	useEffect( () => {
		//console.log( 'running useEffect' );
		const getData = async () => {
			const data = await getApiData();

			setPostsList( ( prevState ) => {
				return prevState.concat( data );
			} );
		};

		getData();
	}, [] );

	return (
		<List separated className="kit-content-list">
			{
				exportContent.map( ( item, index ) => (
					<List.Item key={ index } className="kit-content-list__item">
						<Grid container justify="space-between" alignItems="center">
							<Grid item>
								<Grid container item>
									<Checkbox className="kit-content-list__checkbox" />

									<Grid item>
										<Text size="sm" className="kit-content-list__title">{ item.data.title }</Text>

										<Grid item>
											<Text size="sm" tag="span" className="kit-content-list__description">
												{ item.data.description || ( item.data.features && getFeatures( item.data.features ) ) }
											</Text>
											{ item.data.notice ? getProFeaturesIndication() : null }
										</Grid>
									</Grid>
								</Grid>

								{ item.data.notice ? getNotice( item.data.notice ) : null }
							</Grid>

							{ item.data.notice ? getButton() : null }

							{ getContentSelection( item ) }
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
	content: PropTypes.array,
};

KitContentList.defaultProps = {
	className: '',
};
