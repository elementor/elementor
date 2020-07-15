import List from '../../../ui/list/list';
import Box from '../../../ui/box/box';
import KitContentSelect from './kit-content-select/kit-content-select';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Button from 'elementor-app/ui/molecules/button';

import kitContentData from '../kit-content-data/kit-content-data';

import './kit-content-list.scss';

export default class KitContentList extends React.Component {
	static propTypes = {
		classname: PropTypes.string,
		type: PropTypes.string.isRequired,
		setIncludes: PropTypes.func,
	}

	static defaultProps = {
		className: '',
	}

	state = {
		postsList: [ __( 'Select custom post types (maximum of 20 posts will be included)', 'elementor' ) ],
	}

	getButton = () => (
		<Grid item>
			<Button variant="contained" color="cta" text={ __( 'Lear More', 'elementor' ) } url="/#" />
		</Grid>
	)

	getNotice = ( notice ) => (
		<Box type="notice">
			<Text variant="sm">
				{ notice }
			</Text>
		</Box>
	)

	getProFeaturesIndication = () => (
		<Text variant="md" tag="span" color="cta" className="kit-content-list__pro-indication">
			<strong>{ __( 'Pro Features', 'elementor' ) }</strong>
		</Text>
	)

	getFeatures = ( features ) => {
		const lockedFeatures = features.locked?.length ? <span className="kit-content-list__locked-features">{ features.locked.join( ', ' ) }</span> : null;
		let openFeatures = features.open?.join( ', ' );

		if ( openFeatures && lockedFeatures ) {
			openFeatures += ', ';
		}

		return (
			<>
				{ openFeatures }
				{ lockedFeatures }
			</>
		);
	}

	getContentSelection = () => (
		<Grid container justify="center" className="kit-content-selection-container">
			<KitContentSelect options={ this.state.postsList } />
		</Grid>
	)

	setIncludes	= ( event, includeType ) => {
		const action = event.target.checked ? 'add' : 'remove';

		this.props.setIncludes( includeType, action );
	}

	render() {
		console.log( 'RE-RENDERS: KitContentList() - as class component' );

		return (
			<List separated className="kit-content-list">
				{
					kitContentData.map( ( item, index ) => (
						<List.Item key={ index } className="kit-content-list__item">
							<Grid container justify="space-between" alignItems="center">
								<Grid item>
									<Grid container item>
										<Checkbox onChange={ ( event ) => this.setIncludes( event, item.type ) } className="kit-content-list__checkbox" />

										<Grid item>
											<Heading variant="h3" className="kit-content-list__title">{ item.data.title }</Heading>

											<Grid item>
												<Text variant="sm" tag="span" className="kit-content-list__description">
													{ item.data.description || ( item.data.features && this.getFeatures( item.data.features ) ) }
												</Text>
												{ item.data.notice ? this.getProFeaturesIndication() : null }
											</Grid>
										</Grid>
									</Grid>

									{ item.data.notice ? this.getNotice( item.data.notice ) : null }
								</Grid>

								{ item.data.notice ? this.getButton() : null }

								{ ( 'content' === item.type && 'export' === this.props.type ) ? this.getContentSelection() : null }
							</Grid>
						</List.Item>
					) )
				}
			</List>
		);
	}
}
