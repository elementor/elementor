import { useState } from 'react';

import TemplatesFeatures from './components/templates-features/templates-features';
import KitContentCheckbox from './components/kit-content-checkbox/kit-content-checkbox';
import CptSelections from '../cpt-options-select/cpt-options-select';
import GoProButton from 'elementor-app/molecules/go-pro-button';
import Box from 'elementor-app/ui/atoms/box';
import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';

import './kit-content.scss';

export default function KitContent( { contentData, hasPro, customPostTypesOptions } ) {
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
						// places the select2 component in content section.
						const isSelect = 'content' === type && customPostTypesOptions ? true : false;
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

											<Grid item container direction="column">
												<Text variant="sm" tag="p" className="e-app-export-kit-content__description">
													{ data.description || getTemplateFeatures( data.features, index ) }
												</Text>
												{
													isSelect &&
													<CptSelections options = {customPostTypesOptions}/>
												}
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
	customPostTypesOptions: PropTypes.array,
};

KitContent.defaultProps = {
	className: '',
};
