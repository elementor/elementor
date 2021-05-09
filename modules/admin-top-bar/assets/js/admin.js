import AdminTopBar from './app';

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;

const title = elementorAdminTopBarConfig.page_title;
const buttons = elementorAdminTopBarConfig.page_buttons;

ReactDOM.render(
	<AppWrapper>
		<AdminTopBar title={title} buttons={buttons}/>
	</AppWrapper>,
	document.getElementById( 'e-admin-top-bar' )
);

