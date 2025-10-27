import { transformOriginTransformer, type TransformOrigin } from '../transform-origin-transformer';

function run(val: TransformOrigin) {
    return transformOriginTransformer(
        {
            x: val.x as string,
            y: val.y as string,
            z: val.z as string,
        },
        { key: 'transform-origin', signal: undefined as unknown as AbortSignal }
    );
}

describe('transform-origin-transformer', () => {
	it('returns null for defaults (50% 50% 0px)', () => {
		expect(run({ x: '50%', y: '50%', z: '0px' })).toBeNull();
	});

	it('returns value when non-default provided', () => {
		expect(run({ x: '51%', y: '50%', z: '0px' })).toBe('51% 50% 0px');
		expect(run({ x: '50%', y: '49%', z: '0px' })).toBe('50% 49% 0px');
		expect(run({ x: '50%', y: '50%', z: '1px' })).toBe('50% 50% 1px');
	});
});
