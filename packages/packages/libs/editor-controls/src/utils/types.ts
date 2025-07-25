export type ControlProps< TControlProps = unknown > = TControlProps & {
	context: {
		elementId: string;
	};
};
