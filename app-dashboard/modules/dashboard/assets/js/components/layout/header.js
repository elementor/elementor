import { Grid, Button, Select } from '@elementor/app-ui';
import './header.scss';

export default function Header() {
	const options = [
		{
			label: __( 'Manage Site', 'elementor' ),
			value: 'manageSite',
		},
		{
			label: __( 'Staging', 'elementor' ),
			value: 'https://my.elementor.com/websites/',
		},
		{
			label: __( 'Backups', 'elementor' ),
			value: 'https://my.elementor.com/user-profile/',
		},
		{
			label: __( 'Site Lock', 'elementor' ),
			value: 'https://my.elementor.com/websites/',
		},
		{
			label: __( 'Billing', 'elementor' ),
			value: 'https://my.elementor.com/websites/',
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
					className="eps-sort-select__select"
				/>
			</div>
		</Grid>
	);
}
