export const fileUploadBorderSx = {
	position: 'relative',
	border: 0,
	minHeight: 152,
	'&::before': {
		content: '""',
		position: 'absolute',
		inset: 0,
		pointerEvents: 'none',
		backgroundImage:
			"url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='rgba(0,0,0,0.12)' stroke-width='2' stroke-dasharray='4 4'/%3e%3c/svg%3e\")",
	},
};
