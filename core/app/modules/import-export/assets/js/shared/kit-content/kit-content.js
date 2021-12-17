import { useState } from 'react';

import TemplatesFeatures from './components/templates-features/templates-features';
import KitContentCheckbox from './components/kit-content-checkbox/kit-content-checkbox';
import GoProButton from 'elementor-app/molecules/go-pro-button';
import Box from 'elementor-app/ui/atoms/box';
import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';

import kitContentData from '../kit-content-data/kit-content-data';

import './kit-content.scss';

export default function KitContent( props ) {
	const [ containerHover, setContainerHover ] = useState( {} ),
		// Need to read the hasPro value first from the props because the plugin might be installed during the process.
		hasPro = props.hasPro || elementorAppConfig.hasPro,
		getTemplateFeatures = ( features, index ) => {
			if ( ! features ) {
				return;
			}

			return (
				<TemplatesFeatures
					features={ features }
					isLocked={ ! hasPro }
					showTooltip={ containerHover[ index ] }
				/>
			);
		},
		setContainerHoverState = ( index, state ) => {
			setContainerHover( ( prevState ) => ( { ...prevState, [ index ]: state } ) );
		};

	return (
		<Box>
			<List separated className="e-app-export-kit-content">
				{
					kitContentData.map( ( item, index ) => {
						if ( ! item.data ) {
							return;
						}

						const isLockedFeaturesNoPro = item.data.features?.locked && ! hasPro;

						if ( props.manifest ) {
							const contentType = 'settings' === item.type ? 'site-settings' : item.type;

							if ( ! props.manifest[ contentType ] ) {
								return;
							}
						}

						return (
							<List.Item padding="20" key={ item.type } className="e-app-export-kit-content__item">
								<div
									onMouseEnter={ () => isLockedFeaturesNoPro && setContainerHoverState( index, true ) }
									onMouseLeave={ () => isLockedFeaturesNoPro && setContainerHoverState( index, false ) }
								>
									<Grid container noWrap>
										<KitContentCheckbox type={ item.type } className="e-app-export-kit-content__checkbox" />

										<Grid item>
											<Heading variant="h4" tag="h3" className="e-app-export-kit-content__title">
												{ item.data.title }
											</Heading>

											<Grid item container>
												<Text variant="sm" tag="span" className="e-app-export-kit-content__description">
													{ item.data.description || getTemplateFeatures( item.data.features, index ) }
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
