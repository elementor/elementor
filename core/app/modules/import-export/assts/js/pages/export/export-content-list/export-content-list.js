import { Context as ExportContext } from '../../../context/export';
import KitContentList from '../../../shared/kit-content-list/kit-content-list';

export default function ExportContentList() {
	const { exportContent } = React.useContext( ExportContext );

	return <KitContentList type="export" content={ exportContent } />;
}

ExportContentList.propTypes = {
	classname: PropTypes.string,
	content: PropTypes.array,
};

ExportContentList.defaultProps = {
	className: '',
};
