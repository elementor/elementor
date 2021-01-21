import { memo } from 'react';

import TemplatesFeatures from './templates-features/templates-features';
import KitContentCheckbox from './kit-content-checkbox/kit-content-checkbox';
import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

import useLink from '../../../hooks/use-link/use-link';
import kitContentData from '../kit-content-data/kit-content-data';

import './kit-content-list.scss';

function KitContentList() {
	const hasPro = elementorAppConfig.hasPro,
	{ url } = useLink(),
	getProFeaturesIndication = () => (
		<a
			className="kit-content-list__pro-indication"
			target="_blank"
			rel="noopener noreferrer"
			href={ url.goPro }>
				<Button
					variant="contained"
					size="sm"
					text={ __( 'Go Pro', 'elementor' ) }
					color="cta"
				/>
		</a>
	);

	return (
		<List separated className="kit-content-list">
			{
				kitContentData.map( ( item, index ) => (
					<List.Item separated padding="20" key={ index } className="kit-content-list__item">
						<Grid container>
							<KitContentCheckbox type={ item.type } className="kit-content-list__checkbox" />

							<Grid item className={ 'content' === item.type ? ' kit-content-list-grid--expand' : '' }>
								<Heading variant="h4" tag="h3" className="kit-content-list__title">{ item.data.title }</Heading>

								<Grid item>
									<Text variant="sm" tag="span" className="kit-content-list__description">
										{ item.data.description || ( item.data.features && <TemplatesFeatures features={ item.data.features } hasPro={ hasPro } /> ) }
									</Text>

									{ item.data.features && ! hasPro && getProFeaturesIndication() }
								</Grid>
							</Grid>
						</Grid>
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
