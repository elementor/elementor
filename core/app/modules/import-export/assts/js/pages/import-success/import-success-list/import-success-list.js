import { Context as ImportContext } from '../../../context/import';
import List from '../../../ui/list/list';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

import './import-success-list.scss';

export default function ImportSuccessList() {
	const { importSuccessContent } = React.useContext( ImportContext );

	return (
		<List className="import-success-list">
			{
				importSuccessContent.map( ( item, index ) => (
					<List.Item key={ index } className="import-success-list__item">
						<Grid container justify="space-between">
							<Grid item>
								<strong className="import-success-list__title">{ item.data.title }:</strong>
								<span>{ item.data.items.join( ' | ' ) }</span>
							</Grid>
							<Grid>
								<Button variant="disabled" text={ __( 'Connect & Activate', 'elementor' ) } className="disabled-button import-success-list__button" url="/#"/>
							</Grid>
						</Grid>
					</List.Item>
				) )
			}
		</List>
	);
}
