import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WpClient, AuthContext } from '../lib/wp-client.js';

const OperationSchema = z.discriminatedUnion('op', [
	z.object({
		op: z.literal('update_heading_text'),
		elementId: z.string().describe('ID of the heading widget to update'),
		props: z.object({
			title: z.string().describe('New heading text'),
		}),
	}),
	z.object({
		op: z.literal('insert_heading_widget'),
		parentId: z.string().describe('ID of the container element to append the heading into'),
		props: z.object({
			title: z.string().describe('Heading text for the new widget'),
		}),
	}),
]);

type Operation = z.infer<typeof OperationSchema>;
type ElementNode = {
	id?: string;
	elType?: string;
	widgetType?: string;
	settings?: Record<string, unknown>;
	elements?: ElementNode[];
};

function updateHeadingText(elements: ElementNode[], targetId: string, title: string): ElementNode[] {
	return elements.map((el) => {
		const updated = { ...el };

		if (el.id === targetId && el.widgetType === 'heading') {
			updated.settings = { ...el.settings, title };
		}

		if (el.elements && el.elements.length > 0) {
			updated.elements = updateHeadingText(el.elements, targetId, title);
		}

		return updated;
	});
}

function insertHeadingWidget(elements: ElementNode[], parentId: string, title: string): ElementNode[] {
	return elements.map((el) => {
		const updated = { ...el };

		if (el.id === parentId) {
			const newWidget: ElementNode = {
				id: Math.random().toString(36).slice(2, 10),
				elType: 'widget',
				widgetType: 'heading',
				settings: { title, size: 'default', align: 'left' },
				elements: [],
			};
			updated.elements = [...(el.elements ?? []), newWidget];
		} else if (el.elements && el.elements.length > 0) {
			updated.elements = insertHeadingWidget(el.elements, parentId, title);
		}

		return updated;
	});
}

interface WpPage {
	id: number;
	title: { rendered: string };
	status: string;
	meta: Record<string, unknown>;
}

export function registerApplyPatch(server: McpServer, client: WpClient, getAuth: () => AuthContext): void {
	server.tool(
		'apply_patch',
		'Apply structured mutations to an Elementor document. Supported ops: update_heading_text, insert_heading_widget.',
		{
			post_id: z.number().int().positive().describe('WordPress post/page ID'),
			operations: z.array(OperationSchema).min(1).describe('List of patch operations to apply'),
			preview_only: z.boolean().optional().describe('If true, return the result without saving to the database'),
		},
		async ({ post_id, operations, preview_only }) => {
			const auth = getAuth();

			// Fetch current document via the custom endpoint.
			const doc = await client.get<{ post_id: number; title: string; status: string; tree: ElementNode[] }>(
				`/elementor/v1/oauth/document/${post_id}`,
				auth
			);

			// We need the raw _elementor_data to apply patches and save.
			// Fetch it via the standard WP REST API with context=edit.
			const page = await client.get<WpPage>(
				`/wp/v2/pages/${post_id}?context=edit&_fields=id,title,status,meta`,
				auth
			);

			const rawData = (page.meta['_elementor_data'] as string | undefined) ?? '[]';
			let tree: ElementNode[] = JSON.parse(rawData);

			const summary: string[] = [];

			for (const op of operations as Operation[]) {
				if (op.op === 'update_heading_text') {
					tree = updateHeadingText(tree, op.elementId, op.props.title);
					summary.push(`Updated heading text for element ${op.elementId} → "${op.props.title}"`);
				} else if (op.op === 'insert_heading_widget') {
					tree = insertHeadingWidget(tree, op.parentId, op.props.title);
					summary.push(`Inserted heading widget into container ${op.parentId} with text "${op.props.title}"`);
				}
			}

			if (!preview_only) {
				await client.put(
					`/wp/v2/pages/${post_id}`,
					{ meta: { _elementor_data: JSON.stringify(tree) } },
					auth
				);
			}

			return {
				content: [{
					type: 'text',
					text: JSON.stringify({
						ok: true,
						preview_only: preview_only ?? false,
						summary,
						post_id,
					}, null, 2),
				}],
			};
		}
	);
}
