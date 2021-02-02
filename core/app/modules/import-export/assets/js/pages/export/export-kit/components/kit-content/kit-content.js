import TemplatesFeatures from './components/templates-features/templates-features';
import KitContentCheckbox from './components/kit-content-checkbox/kit-content-checkbox';
import GoProButton from 'elementor-app/molecules/go-pro-button';
import Box from 'elementor-app/ui/atoms/box';
import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';

import kitContentData from './kit-content-data/kit-content-data';

import './kit-content.scss';

export default function KitContent() {
	const hasPro = elementorAppConfig.hasPro,
		getTemplateFeatures = ( features ) => {
			if ( ! features ) {
				return;
			}

			return <TemplatesFeatures features={ features } isLocked={ ! hasPro } />;
		},
		getGoProButton = () => (
			<GoProButton
				className="e-app-export-kit-content__go-pro-button"
				urlParams="utm_source=import-export&utm_medium=app&utm_campaign=go-pro"
			/>
		);

	return (
		<Box>
			<List separated className="e-app-export-kit-content">
				{
					kitContentData.map( ( item, index ) => (
						<List.Item separated padding="20" key={ index } className="e-app-export-kit-content__item">
							<Grid container>
								<KitContentCheckbox type={ item.type } className="e-app-export-kit-content__checkbox" />

								<Grid item>
									<Heading variant="h4" tag="h3" className="e-app-export-kit-content__title">
										{ item.data.title }
									</Heading>

									<Grid item>
										<Text variant="sm" tag="span" className="e-app-export-kit-content__description">
											{ item.data.description || getTemplateFeatures( item.data.features ) }
										</Text>

										{ item.data.features?.locked && ! hasPro && getGoProButton() }
									</Grid>
								</Grid>
							</Grid>
						</List.Item>
					) )
				}
			</List>
		</Box>
	);
}

KitContent.propTypes = {
	className: PropTypes.string,
};

KitContent.defaultProps = {
	className: '',
};
