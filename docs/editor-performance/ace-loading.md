As a user, I want the ACE Editor (~500KB) to load only when I actually use the Code control.

Acceptance Criteria:

Remove ACE from elementor-editor dependencies

Implement lazy loading in Code control class

Load ACE when Code control panel opens

Show loading indicator while library loads

Graceful error handling if load fails

Files to modify:

includes/controls/code.php

core/editor/loader/editor-base-loader.php

Related JS files
