import { Stack, SvgIcon, Typography, Paper, Button } from '@elementor/ui';

export function UpgradeVersionBanner() {
	return (
		<Paper
			color="info"
			elevation={ 0 }
			variant="elevation"
		>
			<Stack
				direction="row"
				sx={ {
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '5px',
					py: 1.5,
					px: 2.5,
				} }
			>
				<Stack
					direction="row"
					sx={ {
						alignItems: 'center',
						gap: '5px',
					} }
				>
					<SvgIcon
						viewBox="0 0 22 22"
						sx={ {
							fontSize: 16,
							color: 'info.light',
						} }
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M4.58268 4.35352C4.5219 4.35352 4.46361 4.37766 4.42064 4.42064C4.37766 4.46361 4.35352 4.5219 4.35352 4.58268V6.64518H6.64518V4.35352H4.58268ZM4.58268 2.97852C4.15723 2.97852 3.7492 3.14753 3.44837 3.44837C3.14753 3.7492 2.97852 4.15723 2.97852 4.58268V17.416C2.97852 17.8415 3.14753 18.2495 3.44837 18.5503C3.74921 18.8512 4.15723 19.0202 4.58268 19.0202H17.416C17.8415 19.0202 18.2495 18.8512 18.5503 18.5503C18.8512 18.2495 19.0202 17.8415 19.0202 17.416V4.58268C19.0202 4.15723 18.8512 3.74921 18.5503 3.44837C18.2495 3.14753 17.8415 2.97852 17.416 2.97852H4.58268ZM8.02018 4.35352V6.64518H17.6452V4.58268C17.6452 4.5219 17.621 4.46361 17.5781 4.42064C17.5351 4.37766 17.4768 4.35352 17.416 4.35352H8.02018ZM17.6452 8.02018H4.35352V17.416C4.35352 17.4768 4.37766 17.5351 4.42064 17.5781C4.46361 17.621 4.5219 17.6452 4.58268 17.6452H17.416C17.4768 17.6452 17.5351 17.621 17.5781 17.5781C17.621 17.5351 17.6452 17.4768 17.6452 17.416V8.02018Z"
							fill="currentColor"
						/>
					</SvgIcon>
					<Typography variant="body2">
						{ __( 'You’re using an older Elementor version. Update for full customization.', 'elementor' ) }
					</Typography>
				</Stack>
				<Button
					variant="outlined"
					onClick={ () => window.open( elementorAppConfig[ 'import-export-customization' ]?.upgradeVersionUrl, '_blank' ) }
					color="info"
				>
					{ __( 'Update version', 'elementor' ) }
				</Button>
			</Stack>
		</Paper>
	);
}
