export default function AnnouncementsHeader() {
	const onCloseButton = () => {
		document.getElementById( "e-announcements-root" ).remove();
	}
	return (
		<div className="announcements-heading-container">
			<i className="eicon-elementor" aria-hidden="true"/>
			<span className="heading-title">What's New</span>
			<button className="close-button" onClick={ onCloseButton }>
				<i className="eicon-close" aria-hidden="true"/>
			</button>
		</div>
	);
}
