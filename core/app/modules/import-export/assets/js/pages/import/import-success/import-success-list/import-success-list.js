import List from 'elementor-app/ui/molecules/list';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

import kitContentData from '../../../../shared/kit-content/kit-content-data/kit-content-data';

import './import-success-list.scss';

export default function ImportSuccessList() {
	return (
		<List className="import-success-list">
			{
				kitContentData.map( ( item, index ) => (
					<List.Item padding="10 0" key={ index } className="import-success-list__item">
						<Grid container justify="space-between">
							<Grid item>
								<Text variant="xs" tag="span" className="import-success-list__title"><strong>{ item.data.title + ':' }</strong></Text>
								<Text variant="xs" tag="span">XXX | XXX | XXX</Text>
							</Grid>

							<Grid>
								<Button variant="contained" color="disabled" text={ __( 'Connect & Activate', 'elementor' ) + ' >' } className="disabled-button import-success-list__button" url="/#"/>
							</Grid>
						</Grid>
					</List.Item>
				) )
			}
		</List>
	);
}
