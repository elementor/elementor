# Editor Sidebar

Persistent navigation rail on the inline-start side of the editor. Features register their destinations through the sidebar locations.

```ts
import { injectIntoSidebarFooter, injectIntoSidebarTools } from '@elementor/editor-sidebar';

injectIntoSidebarTools( { id: 'my-tool', component: MyTool } );
injectIntoSidebarFooter( { id: 'my-footer-item', component: MyFooterItem } );
```
