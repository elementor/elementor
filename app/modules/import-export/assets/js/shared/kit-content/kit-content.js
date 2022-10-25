import { useState, useContext } from 'react';

import TemplatesFeatures from './components/templates-features/templates-features';
import KitContentCheckbox from './components/kit-content-checkbox/kit-content-checkbox';
import CptOptionsSelectBox from '../cpt-select-box/cpt-select-box';
import GoProButton from 'elementor-app/molecules/go-pro-button';
import Box from 'elementor-app/ui/atoms/box';
import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import { SharedContext } from './../../context/shared-context/shared-context-provider.js';

import './kit-content.scss';

export default function KitContent( { contentData, hasPro } ) {
	const [ containerHover, setContainerHover ] = useState( {} ),
		sharedContext = useContext( SharedContext ),
		{ referrer, currentPage } = sharedContext.data,
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
		eventTracking = ( event, chosenPart ) => {
			if ( 'kit-library' === referrer ) {
				const command = event.target.checked && event.target.checked ? 'check' : 'uncheck';
				appsEventTrackingDispatch(
					`kit-library/${ command }`,
					{
						page_source: 'import',
						step: currentPage,
						event_type: 'click',
						site_part: chosenPart,
					},
				);
			}
		};

	if ( ! contentData.length ) {
		return null;
	}

	return (
		<Box>
			<List separated className="e-app-export-kit-content">
				{
					contentData.map( ( { type, data }, index ) => {
						const isLockedFeaturesNoPro = data.features?.locked && ! isProExist;
						return (
							<List.Item padding="20" key={ type } className="e-app-export-kit-content__item">
								<div
									onMouseEnter={ () => isLockedFeaturesNoPro && setContainerHoverState( index, true ) }
									onMouseLeave={ () => isLockedFeaturesNoPro && setContainerHoverState( index, false ) }
								>
									<Grid container noWrap >
										<KitContentCheckbox
											type={ type }
											className="e-app-export-kit-content__checkbox"
											onCheck={ ( event, chosenPart ) => {
												eventTracking( event, chosenPart );
											} }
										/>

										<Grid item container>
											<Heading variant="h4" tag="h3" className="e-app-export-kit-content__title">
												{ data.title }
											</Heading>

											<Grid item container direction={ isLockedFeaturesNoPro ? 'row' : 'column' } alignItems={ 'baseline' } >
												<Text variant="sm" tag="p" className="e-app-export-kit-content__description">
													{ data.description || getTemplateFeatures( data.features, index ) }
												</Text>
												{ 'content' === type && <CptOptionsSelectBox /> }
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
	contentData: PropTypes.array.isRequired,
	hasPro: PropTypes.bool,
};

KitContent.defaultProps = {
	className: '',
};
