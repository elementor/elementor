import useConfig from "../hooks/useConfig";

const Notice = () => {
	const [ notice ] = useConfig('notice');

	if (!notice) {
		return null;
	}

	console.log(notice);
	return (
		<div id="e-notice-bar">
			<i className="eicon-elementor-square"></i>
			<div id="e-notice-bar__message">
				{notice.message}
			</div>
			<div id="e-notice-bar__action">
				<a href={notice.action_url} target="_blank" rel="noreferrer">
					{notice.action_title}
				</a>
			</div>
			<i id="e-notice-bar__close" className="eicon-close"></i>
		</div>
	)
}
export default Notice;
