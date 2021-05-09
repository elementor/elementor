export default function pageButton( props ) {
	const { label, ...buttonAttributes } = props;

	return (
		<button { ...buttonAttributes }>
			{ label }
		</button>
	);
}
