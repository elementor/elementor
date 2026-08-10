import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { applyLocalMutation } from '../service';
import { type TVariable } from '../storage';
import { MANAGE_VARIABLES_GUIDE_URI } from './variable-tool-prompt';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'manage-global-variable';

type MutationPayload = {
  variable?: TVariable & { id: string };
  watermark?: number;
};

type VariableAction = 'create' | 'update' | 'delete';

let pendingAction: VariableAction | undefined;

const beforeCall = async ( input: unknown ) => {
  pendingAction = ( input as { action: VariableAction } ).action;
};

const afterResponse = async ( result: unknown ) => {
  const { variable, watermark } = result as MutationPayload;
  if ( pendingAction && variable && typeof watermark === 'number' ) {
    applyLocalMutation( pendingAction, variable, watermark );
  }
  pendingAction = undefined;
};

export const initManageVariableTool = ( reg: MCPRegistryEntry ) => {
  reg.resource(
    'manage-global-variable-guide',
    MANAGE_VARIABLES_GUIDE_URI,
    {
      title: 'Manage Global Variable Guide',
      description: 'Detailed guide for using the manage-global-variable tool',
      mimeType: 'text/plain',
    },
    async ( uri: URL ) => {
      const { data } = await httpService().get< HttpResponse< string > >( MCP_PROXY_URL, {
        params: { uri: uri.href },
      } );
      return {
        contents: [
          { uri: uri.href, mimeType: 'text/plain', text: ( data as { data: string } ).data },
        ],
      };
    }
  );
  reg.addProxyTool( TOOL_NAME, { hooks: { beforeCall, afterResponse } } );
};
