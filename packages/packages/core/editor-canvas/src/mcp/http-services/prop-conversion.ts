import { type HttpResponse, httpService } from '@elementor/http-client';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const DEFAULT_DIALECT = 'llm';

type PropRecord = Record< string, unknown >;

export async function toCanonical(
	widgetType: string,
	props: PropRecord,
	dialect = DEFAULT_DIALECT
): Promise< PropRecord > {
	const { data } = await httpService().post< HttpResponse< PropRecord > >( MCP_PROXY_URL, {
		tool: 'to-canonical',
		input: { widget_type: widgetType, props, dialect },
	} );

	return data.data;
}

export async function toDialect(
	widgetType: string,
	props: PropRecord,
	dialect = DEFAULT_DIALECT
): Promise< PropRecord > {
	const { data } = await httpService().post< HttpResponse< PropRecord > >( MCP_PROXY_URL, {
		tool: 'to-dialect',
		input: { widget_type: widgetType, props, dialect },
	} );

	return data.data;
}
