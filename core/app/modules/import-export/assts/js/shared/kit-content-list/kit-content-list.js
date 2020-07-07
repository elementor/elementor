import List from '../../ui/list/list';
import Text from '../../ui/text/text';
import Box from '../../ui/box/box';
import KitContentSelect from './kit-content-select/kit-content-select';
import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Button from 'elementor-app/ui/molecules/button';

import './kit-content-list.scss';

export default function KitContentList( props ) {
	const getButton = () => (
			<Grid item>
				<Button variant="cta" text={ __( 'Lear More', 'elementor' ) } url="/#" />
			</Grid>
		),
		getNotice = ( notice ) => (
			<Box type="notice" className="">
				<Text size="sm">
					{ notice }
				</Text>
			</Box>
		),
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

	return (
		<List separated className="kit-content-list">
			{
				props.content.map( ( item, index ) => (
					<List.Item key={ index } className="kit-content-list__item">
						<Grid container justify="space-between" alignItems="center">
							<Grid item>
								<Grid container item>
									<Checkbox className="kit-content-list__checkbox" />

									<Grid item>
										<Text size="sm" className="kit-content-list__title">{ item.data.title }</Text>

										<Grid item>
											<Text size="sm" tag="span" className="kit-content-list__description">{ item.data.description }</Text>
											{ item.data.notice ? <Button color="cta" text={ __( 'Pro Features', 'elementor' ) } url="/#" /> : null }
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
