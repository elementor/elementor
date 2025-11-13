export type RenderGate = () => boolean;

let attributesGate: RenderGate = () => false;

export function setShouldRenderAttributesGate(gate: RenderGate): void {
	attributesGate = gate;
}

export function shouldRenderAttributes(): boolean {
	return attributesGate();
}


