export default function AnnouncementBody( { announcement } ) {
	const { title, description, media } = announcement;

	return (
		<div className="announcement-body-container">
			<div className={ `announcement-body-media announcement-body-${ media.type }` }>
				{ 'image' === media.type ? (
					<img src={ media.src }/>
				) : (
					<video controls width="100%">
						<source src={ media.src } type="video/mp4"/>
						Sorry, your browser doesn't support videos. </video>
				) }
			</div>
			<div className="announcement-body-title">
				{ title }
			</div>
			<div className="announcement-body-description">
				{ description }
			</div>
		</div>
	);
}
