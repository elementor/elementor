import Box from 'elementor-app/ui/atoms/box';
import TemplatesFeatures from './components/templates-features/templates-features';
import KitContentCheckbox from './components/kit-content-checkbox/kit-content-checkbox';
import GoProButton from './components/go-pro-button/go-pro-button';
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
		};

	return (
		<Box>
			<List separated className="kit-content">
				{
					kitContentData.map( ( item, index ) => (
						<List.Item separated padding="20" key={ index } className="kit-content__item">
							<Grid container>
								<KitContentCheckbox type={ item.type } className="kit-content__checkbox" />

								<Grid item>
									<Heading variant="h4" tag="h3" className="kit-content__title">
										{ item.data.title }
									</Heading>

									<Grid item>
										<Text variant="sm" tag="span" className="kit-content__description">
											{ item.data.description || getTemplateFeatures( item.data.features ) }
										</Text>

										{ item.data.features && ! hasPro && <GoProButton className="kit-content__go-pro-button" /> }
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
