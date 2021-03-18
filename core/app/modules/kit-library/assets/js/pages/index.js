import { SearchInput, Grid } from '@elementor/app-ui';
import Layout from '../components/layout';
import IndexSidebar from '../components/index-sidebar';
import Header from '../components/layout/header';
import KitList from '../components/kit-list';
import useKits from '../hooks/use-kits';
import Content from '../../../../../assets/js/layout/content';
import useHeadersButtons from '../hooks/use-headers-buttons';

import './index.scss';

const { useState } = React;

export default function Index() {
	const headerButtons = useHeadersButtons( [ 'info' ] );
	const { data, isSuccess, isLoading, isError } = useKits();
	const [ search, setSearch ] = useState( '' );

	return (
		<Layout
			sidebar={ <IndexSidebar/> }
			header={ <Header buttons={ headerButtons }/> }
		>
			<div className="e-kit-library__index-layout-container">
				<div className="e-kit-library__index-layout-search-area">
					<Grid container>
						<div style={ { flex: 1 } }>
							<SearchInput
								placeholder={ __( 'Search a kit theme or style', 'elementor' ) }
								value={ search }
								onChange={ ( e ) => setSearch( e.target.value ) }
							/>
						</div>
						<div>
						</div>
					</Grid>
				</div>
				<Content className="e-kit-library__index-layout-main">
					<>
						{ isLoading && 'Loading...' }
						{ isError && 'Error' }
						{ isSuccess && <KitList data={ data }/> }
					</>
				</Content>
			</div>
		</Layout>
	);
}
