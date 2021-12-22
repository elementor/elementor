import { useState } from 'react';

import TemplatesFeatures from './components/templates-features/templates-features';
import KitContentCheckbox from './components/kit-content-checkbox/kit-content-checkbox';
import GoProButton from 'elementor-app/molecules/go-pro-button';
import Box from 'elementor-app/ui/atoms/box';
import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';

import MessageBanner from '../../ui/message-banner/message-banner';

import kitContentData from '../kit-content-data/kit-content-data';

import './kit-content.scss';

export default function KitContent( { manifest, hasPro } ) {
	const [ containerHover, setContainerHover ] = useState( {} ),
		// Need to read the hasPro value first from the props because the plugin might be installed during the process.
		isProExist = hasPro || elementorAppConfig.hasPro,
		getTemplateFeatures = ( features, index ) => {
			if ( ! features ) {
				return;
			}

			return (
				<TemplatesFeatures
					features={ features }
					isLocked={ ! isProExist }
					showTooltip={ containerHover[ index ] }
				/>
			);
		},
		setContainerHoverState = ( index, state ) => {
			setContainerHover( ( prevState ) => ( { ...prevState, [ index ]: state } ) );
		},
		getManifestContent = () => {
			return kitContentData.filter( ( { type } ) => {
				const contentType = 'settings' === type ? 'site-settings' : type,
					contentData = manifest[ contentType ];

				return ! ! ( Array.isArray( contentData ) ? contentData.length : contentData );
			} );
		},
		kitContent = manifest ? getManifestContent() : kitContentData;

	if ( ! kitContent.length ) {
		return <MessageBanner description={ __( 'This kit has no content.', 'elementor' ) } />;
	}

	return (
		<Box>
			<List separated className="e-app-export-kit-content">
				{
					kitContent.map( ( { type, data }, index ) => {
						const isLockedFeaturesNoPro = data.features?.locked && ! isProExist;

						return (
							<List.Item padding="20" key={ type } className="e-app-export-kit-content__item">
								<div
									onMouseEnter={ () => isLockedFeaturesNoPro && setContainerHoverState( index, true ) }
									onMouseLeave={ () => isLockedFeaturesNoPro && setContainerHoverState( index, false ) }
								>
									<Grid container noWrap>
										<KitContentCheckbox type={ type } className="e-app-export-kit-content__checkbox" />

										<Grid item>
											<Heading variant="h4" tag="h3" className="e-app-export-kit-content__title">
												{ data.title }
											</Heading>

											<Grid item container>
												<Text variant="sm" tag="span" className="e-app-export-kit-content__description">
													{ data.description || getTemplateFeatures( data.features, index ) }
												</Text>

												{
													isLockedFeaturesNoPro &&
													<GoProButton
														className="e-app-export-kit-content__go-pro-button"
														url="https://go.elementor.com/go-pro-import-export"
													/>
												}
											</Grid>
										</Grid>
									</Grid>
								</div>
							</List.Item>
						);
					} )
				}
			</List>
		</Box>
	);
}

KitContent.propTypes = {
	className: PropTypes.string,
	manifest: PropTypes.object,
	hasPro: PropTypes.bool,
};

KitContent.defaultProps = {
	className: '',
};
