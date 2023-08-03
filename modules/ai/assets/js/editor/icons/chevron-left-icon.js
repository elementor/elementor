import { SvgIcon } from '@elementor/ui';

const ChevronLeftIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" d="M15.5303 18.2803C15.8232 17.9874 15.8232 17.5126 15.5303 17.2197L10.0607 11.75L15.5303 6.28033C15.8232 5.98744 15.8232 5.51256 15.5303 5.21967C15.2374 4.92678 14.7626 4.92678 14.4697 5.21967L8.46967 11.2197C8.17678 11.5126 8.17678 11.9874 8.46967 12.2803L14.4697 18.2803C14.7626 18.5732 15.2374 18.5732 15.5303 18.2803Z" />
		</SvgIcon>
	);
} );

export default ChevronLeftIcon;
