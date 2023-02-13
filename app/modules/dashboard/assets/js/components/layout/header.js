import { Grid, Button, Select } from '@elementor/app-ui';
import './header.scss';

export default function Header() {
	const options = [
		{
			label: __( 'Manage Site', 'elementor' ),
			value: 'manageSite',
		},
		{
			label: __( 'Featured', 'elementor' ),
			value: 'featuredIndex',
		},
		{
			label: __( 'New', 'elementor' ),
			value: 'createdAt',
		},
		{
			label: __( 'Popular', 'elementor' ),
			value: 'popularityIndex',
		},
		{
			label: __( 'Trending', 'elementor' ),
			value: 'trendIndex',
		},
	];

	return (
		<Grid container alignItems="center" justify="space-between" className="eps-app__header">
			<a
				className="eps-app__logo-title-wrapper"
				href="#/kit-library"
			>
				<h1 className="eps-app__title">{ __( 'Elementor', 'elementor' ) }</h1>
			</a>
			<div className="eps-app__header-buttons">
				<Button
					text={ __( 'Support', 'elementor' ) }
					variant={ 'contained' }
					color={ 'primary' }
					size={ 'lg' }
				/>
				<Select
					options={ options }
					value={ 'manageSite' }
					onChange={ ( e ) => {
						window.open( e.target.value );
					} }
					className="eps-sort-select__select"
				/>
			</div>
		</Grid>
	);
}
