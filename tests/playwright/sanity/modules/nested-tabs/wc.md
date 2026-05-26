Skip to content
elementor
hello-plus
Repository navigation
Code
Pull requests
6
 (6)
Agents
Actions
Security and quality
Insights
Settings
Playwright Tests with WooCommerce
Playwright Tests with WooCommerce #237
All jobs
Run details
Annotations
10 errors, 1 warning, and 1 notice
WooCommerce E2E Tests - Shard 2
failed 2 hours ago in 22m 13s
Search logs
2s
1s
7s
14s
Run shivammathur/setup-php@v2
/usr/bin/bash /home/runner/work/_actions/shivammathur/setup-php/v2/src/scripts/run.sh

==> Setup PHP
✓ PHP Updated to PHP 8.1.34

==> Setup Tools
✓ composer Added composer 2.9.8

==> Setup Coverage
✓ none Disabled Xdebug and PCOV

==> Sponsor setup-php
✓ setup-php https://setup-php.com/sponsor
43s
Prepare all required actions
Run ./.github/workflows/npm-install-with-retry
Run # NPM install with retry logic to handle rate limiting (HTTP 429)
📦 Installing npm dependencies with retry logic...
📋 Command: npm ci
📋 Max attempts: 3
📋 Base delay: 30s
📋 Working directory: .
⏳ Adding random delay of 23s to avoid request collision...

🔄 Attempt 1/3: Running npm ci

added 1695 packages in 18s
✅ npm operation succeeded on attempt 1
Run echo "📦 Installing composer dependencies..."
📦 Installing composer dependencies...
Installing dependencies from lock file
Verifying lock file contents can be installed on current platform.
Package operations: 1 install, 0 updates, 0 removals
  - Downloading elementor/wp-notifications-package (1.2.0)
  - Installing elementor/wp-notifications-package (1.2.0): Extracting archive
Generating optimized autoload files
✅ Composer dependencies installed successfully
Run echo "🔍 Verifying installation..."
🔍 Verifying installation...
📁 Node modules size: 644M
📁 Vendor size: 160K
✅ package-lock.json is present
✅ Installation verification completed
24s
Run actions/download-artifact@v4
Downloading single artifact
Preparing to download the following artifacts:
- hello-plus-wc-hpmain-wcnightly-ellatest-stable-20260526-0747 (ID: 7211621237, Size: 166223155, Expected Digest: sha256:f20d35985efd26768f3484adaff4c15e6660f9e7154b6a418b53a32b6cce77ab)
Redirecting to blob download url: https://productionresultssa3.blob.core.windows.net/actions-results/d6c07e01-2309-4625-af1f-11dd5b0e8726/workflow-job-run-ad5ed37b-29cb-54b7-a229-4f19983c827a/artifacts/8283f2dda602509091e6c4e4fe82f3fdf194b63626673f3ed23b6ed691d88a43.zip
Starting download of artifact to: /home/runner/work/hello-plus/hello-plus
(node:2364) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
SHA256 digest of downloaded artifact is f20d35985efd26768f3484adaff4c15e6660f9e7154b6a418b53a32b6cce77ab
Artifact download completed successfully.
Total of 1 artifact(s) downloaded
Download artifact has finished successfully
1s
Run echo "Setting up components from build artifacts..."
Setting up components from build artifacts...
Available files after artifact download:
total 1088
drwxr-xr-x   17 runner runner   4096 May 26 07:52 .
drwxr-xr-x    3 runner runner   4096 May 26 07:50 ..
-rw-r--r--    1 runner runner     25 May 26 07:50 .browserslistrc
-rw-r--r--    1 runner runner    357 May 26 07:50 .buildignore
drwxr-xr-x    3 runner runner   4096 May 26 07:50 .cursor
-rw-r--r--    1 runner runner    403 May 26 07:50 .editorconfig
-rw-r--r--    1 runner runner    112 May 26 07:50 .eslintignore
-rw-r--r--    1 runner runner   5079 May 26 07:50 .eslintrc.js
drwxr-xr-x    7 runner runner   4096 May 26 07:50 .git
drwxr-xr-x    5 runner runner   4096 May 26 07:50 .github
-rw-r--r--    1 runner runner    217 May 26 07:50 .gitignore
drwxr-xr-x    2 runner runner   4096 May 26 07:50 .vscode
-rw-r--r--    1 runner runner    530 May 26 07:50 .wp-env.json
drwxr-xr-x    2 runner runner   4096 May 26 07:50 .wporg-assets
drwxr-xr-x    2 runner runner   4096 May 26 07:50 bin
drwxr-xr-x    3 runner runner   4096 May 26 07:50 classes
-rw-r--r--    1 runner runner   1492 May 26 07:50 composer.json
-rw-r--r--    1 runner runner 111961 May 26 07:50 composer.lock
drwxr-xr-x    4 runner runner   4096 May 26 07:50 dev
Detailed artifact structure:
./modules/admin/assets/js/icons/elementor.tsx
./vendor/elementor
./tmp
./tmp/elementor
./tmp/elementor/core/admin/editor-one-menu/elementor-one-menu-manager.php
./tmp/elementor/core/isolation/elementor-adapter-interface.php
./tmp/elementor/core/isolation/elementor-counter-adapter-interface.php
./tmp/elementor/core/isolation/elementor-adapter.php
./tmp/elementor/modules/elementor-counter
./tmp/elementor/modules/safe-mode/mu-plugin/elementor-safe-mode.php
Hello Plus found at ./tmp/hello-plus (from artifacts)
Verifying Hello Plus:
-rw-r--r-- 1 runner runner 2159 May 26 07:52 ./tmp/hello-plus/hello-plus.php
Elementor found at ./tmp/elementor (from artifacts)
Verifying Elementor:
-rw-r--r-- 1 runner runner 4353 May 26 07:51 ./tmp/elementor/elementor.php
WooCommerce found at ./woocommerce (from artifacts)
Verifying WooCommerce:
-rw-r--r-- 1 runner runner 1850 May 26 07:52 ./woocommerce/woocommerce.php
4s
Run echo "Destroying any existing wp-env containers and volumes..."
Destroying any existing wp-env containers and volumes...
ℹ WARNING! This will remove Docker containers, volumes, networks, and images associated with the WordPress instance.
? Are you sure you want to continue? (y/N)
25hCancelled.
No existing containers to destroy
0s
Run echo "WooCommerce test job theme configuration: TEST_THEME=$TEST_THEME"
WooCommerce test job theme configuration: TEST_THEME=hello-biz
Generating wp-env.json for WooCommerce testing...
🔧 Building dynamic wp-env configuration...
📋 PHP Version: 8.1
📋 WordPress Core: latest
📋 Hello Plus: main
📋 Elementor: latest-stable
📋 Test Theme: hello-biz
🔍 DEBUG: WP_CORE_VERSION input: "latest"
🔍 DEBUG: wpCore calculated: null
🔍 DEBUG: wpEnv.core set to: null
✅ Using Hello Biz theme from WordPress.org
🔍 =============================================
🔍 BUILD-WP-ENV.JS HELLO PLUS CONFIGURATION
🔍 =============================================
🎯 HELLO_PLUS_VERSION: "main"
✅ Using Hello Plus from ./tmp/hello-plus (built from source with tests)
📁 Hello Plus directory contents (21 items): [
  'assets',
  'bin',
  'classes',
  'composer.json',
  'composer.lock',
  'dev',
  'hello-plus.php',
  'includes',
  'index.php',
  'modules'
]
✅ Main plugin file found: hello-plus.php
✅ Tests directory found: tests/
✅ Assets directory found: assets/
✅ Vendor directory found: vendor/
✅ Composer autoload found: vendor/autoload.php
🔍 ==========================================
🔍 BUILD-WP-ENV.JS ELEMENTOR CONFIGURATION
🔍 ==========================================
🎯 ELEMENTOR_VERSION: "latest-stable"
✅ Using WordPress.org Elementor latest-stable (direct)
⚠️ Elementor Pro not found at ./elementor-pro, skipping
✅ Adding WooCommerce from base configuration
✅ Preserved base mappings: [ 'hello-plus-config' ]
🔍 DEBUG: Final wpEnv.core before writing: null
🔍 DEBUG: wp-env JSON preview (first 300 chars):
{
  "core": null,
  "phpVersion": "8.1",
  "plugins": [
    "./tmp/hello-plus",
    "https://downloads.wordpress.org/plugin/elementor.latest-stable.zip",
    "https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip"
  ],
  "themes": [
    "https://downloads.wordpress.org/theme/hello-biz...
✅ Dynamic wp-env configuration written to .wp-env.json
🔍 =====================================
🔍 FINAL WP-ENV CONFIGURATION SUMMARY
🔍 =====================================
📦 Themes (1): [ 'https://downloads.wordpress.org/theme/hello-biz.zip' ]
🔌 Plugins (3): [
  './tmp/hello-plus',
  'https://downloads.wordpress.org/plugin/elementor.latest-stable.zip',
  'https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip'
]
⚙️ Config keys: [
  'ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS',
  'SCRIPT_DEBUG',
  'WP_DEBUG',
  'WP_DEBUG_LOG',
  'WP_DEBUG_DISPLAY',
  'HELLO_PLUS_DEBUG'
]
🐘 PHP Version: 8.1
🌐 WordPress Core: latest (null)
🔍 wpEnv.core actual value: null
✅ wp-env configuration validation passed
🎯 Ready for Hello Plus testing!
Generated wp-env.json:
{
  "core": null,
  "phpVersion": "8.1",
  "plugins": [
    "./tmp/hello-plus",
    "https://downloads.wordpress.org/plugin/elementor.latest-stable.zip",
    "https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip"
  ],
  "themes": [
    "https://downloads.wordpress.org/theme/hello-biz.zip"
  ],
  "mappings": {
    "hello-plus-config": "./tests/wp-env/config"
  },
  "config": {
    "ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS": true,
    "SCRIPT_DEBUG": false,
    "WP_DEBUG": true,
    "WP_DEBUG_LOG": true,
    "WP_DEBUG_DISPLAY": false,
    "HELLO_PLUS_DEBUG": true
  }
}
2m 11s
Run echo "Starting WordPress environment with WooCommerce..."
Starting WordPress environment with WooCommerce...
Attempt 1/3: Starting wp-env...
WordPress development site started at http://localhost:8888
WordPress test site started at http://localhost:8889
MySQL is listening on port 32768
MySQL for automated testing is listening on port 32769

 ✔ Done! (in 120s 58ms)
wp-env started successfully on attempt 1
1m 7s
Run echo "Setting up WordPress environment using Hello Plus setup script..."
Setting up WordPress environment using Hello Plus setup script...
ℹ Starting 'bash hello-plus-config/setup.sh' on the cli container. 

+ wp plugin install wordpress-importer --activate
Notice: Function _load_textdomain_just_in_time was called <strong>incorrectly</strong>. Translation loading for the <code>woocommerce</code> domain was triggered too early. This is usually an indicator for some code in the plugin or theme running too early. Translations should be loaded at the <code>init</code> action or later. Please see <a href="https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/">Debugging in WordPress</a> for more information. (This message was added in version 6.7.0.) in /var/www/html/wp-includes/functions.php on line 6170
Installing WordPress Importer (0.9.5)
Downloading installation package from https://downloads.wordpress.org/plugin/wordpress-importer.0.9.5.zip...
Unpacking the package...
Installing the plugin...
Plugin installed successfully.
Activating 'wordpress-importer'...
Plugin 'wordpress-importer' activated.
Success: Installed 1 of 1 plugins.
+ wp plugin activate elementor
Warning: Plugin 'elementor' is already active.
Success: Plugin already activated.
+ wp plugin activate woocommerce
Warning: Plugin 'woocommerce' is already active.
Success: Plugin already activated.
+ wp theme list --field=name
+ grep -q hello-commerce
+ wp theme list --field=name
+ grep -q hello-biz
+ echo 'Activating Hello Biz theme'
+ wp theme activate hello-biz
Activating Hello Biz theme
Success: Switched to 'Hello Biz' theme.
+ wp plugin activate hello-plus
Success: Plugin already activated.
Warning: Plugin 'hello-plus' is already active.
+ wp plugin list --field=name
+ grep -q elementor-pro
+ echo 'Elementor Pro not installed - skipping deactivation'
Elementor Pro not installed - skipping deactivation
+ WP_CLI_CONFIG_PATH=hello-plus-config/wp-cli.yml
+ wp rewrite structure /%postname%/ --hard
Success: Rewrite structure set.
Success: Rewrite rules flushed.
+ wp user meta add admin wp_persisted_preferences 'a:2:{s:14:\"core/edit-post\";a:2:{b:1;s:12:\"welcomeGuide\";b:0;}}'
Success: Added custom field.
+ wp option update e_editor_counter 10
Success: Updated 'e_editor_counter' option.
+ wp option update elementor_checklist '{"last_opened_timestamp":null,"first_closed_checklist_in_editor":true,"is_popup_minimized":false,"steps":[],"should_open_in_editor":false,"editor_visit_count":10}'
Success: Updated 'elementor_checklist' option.
+ wp option set elementor_onboarded true
Success: Updated 'elementor_onboarded' option.
++ wp user list --field=ID
+ for id in $(wp user list --field=ID)
+ wp user meta add 1 announcements_user_counter 999
Success: Added custom field.
+ wp user meta add 1 elementor_onboarded 'a:1:{s:27:"ai-get-started-announcement";b:1;}'
Success: Added custom field.
+ wp cache flush
Success: The cache was flushed.
+ wp rewrite flush --hard
Success: Rewrite rules flushed.
+ wp help elementor
+ wp elementor flush-css
Success: Flushed the Elementor CSS Cache
+ wp plugin is-active woocommerce
+ echo 'WooCommerce is active - installing pages'
WooCommerce is active - installing pages
+ wp wc tool run install_pages --user=admin
Success: Updated system_status_tool install_pages.
+ '[' -f ./wp-content/plugins/hello-plus/tests/playwright/sample-data/sample_products_with_acf_meta.xml ']'
+ echo 'Importing sample data'
+ wp import ./wp-content/plugins/hello-plus/tests/playwright/sample-data/sample_products_with_acf_meta.xml --authors=skip --quiet --allow-root
Importing sample data
Warning: exif_read_data(vnech-tee-green-1.jpg): Incorrect APP1 Exif Identifier Code in /var/www/html/wp-admin/includes/image.php on line 949
Warning: exif_read_data(vnech-tee-blue-1.jpg): Incorrect APP1 Exif Identifier Code in /var/www/html/wp-admin/includes/image.php on line 949
Warning: exif_read_data(hoodie-blue-1.jpg): Incorrect APP1 Exif Identifier Code in /var/www/html/wp-admin/includes/image.php on line 949
Warning: exif_read_data(hoodie-green-1.jpg): Incorrect APP1 Exif Identifier Code in /var/www/html/wp-admin/includes/image.php on line 949
Warning: exif_read_data(single-1.jpg): Incorrect APP1 Exif Identifier Code in /var/www/html/wp-admin/includes/image.php on line 949
+ '[' -f ./wp-content/plugins/hello-plus/tests/playwright/sample-data/hello-plus-footer.xml ']'
+ echo 'Importing Hello Plus footer data'
+ wp import ./wp-content/plugins/hello-plus/tests/playwright/sample-data/hello-plus-footer.xml --authors=skip --quiet --allow-root
<p>All done. <a href="http://localhost:8888/wp-admin/">Have fun!</a></p><p>Remember to update the passwords and roles of imported users.</p>Importing Hello Plus footer data
✔ Ran `bash hello-plus-config/setup.sh` in 'cli'. (in 24s 642ms)
ℹ Starting 'bash hello-plus-config/setup.sh' on the tests-cli container. 

+ wp plugin install wordpress-importer --activate
<p>All done. <a href="http://localhost:8888/wp-admin/">Have fun!</a></p><p>Remember to update the passwords and roles of imported users.</p>Installing WordPress Importer (0.9.5)
Downloading installation package from https://downloads.wordpress.org/plugin/wordpress-importer.0.9.5.zip...
Unpacking the package...
Installing the plugin...
Plugin installed successfully.
Activating 'wordpress-importer'...
Plugin 'wordpress-importer' activated.
Success: Installed 1 of 1 plugins.
+ wp plugin activate elementor
Warning: Plugin 'elementor' is already active.
Success: Plugin already activated.
+ wp plugin activate woocommerce
Warning: Plugin 'woocommerce' is already active.
Success: Plugin already activated.
+ wp theme list --field=name
+ grep -q hello-commerce
+ wp theme list --field=name
+ grep -q hello-biz
+ echo 'Activating Hello Biz theme'
+ wp theme activate hello-biz
Activating Hello Biz theme
Success: Switched to 'Hello Biz' theme.
+ wp plugin activate hello-plus
Warning: Plugin 'hello-plus' is already active.
Success: Plugin already activated.
+ wp plugin list --field=name
+ grep -q elementor-pro
+ echo 'Elementor Pro not installed - skipping deactivation'
Elementor Pro not installed - skipping deactivation
+ WP_CLI_CONFIG_PATH=hello-plus-config/wp-cli.yml
+ wp rewrite structure /%postname%/ --hard
Success: Rewrite structure set.
Success: Rewrite rules flushed.
+ wp user meta add admin wp_persisted_preferences 'a:2:{s:14:\"core/edit-post\";a:2:{b:1;s:12:\"welcomeGuide\";b:0;}}'
Success: Added custom field.
+ wp option update e_editor_counter 10
Success: Updated 'e_editor_counter' option.
+ wp option update elementor_checklist '{"last_opened_timestamp":null,"first_closed_checklist_in_editor":true,"is_popup_minimized":false,"steps":[],"should_open_in_editor":false,"editor_visit_count":10}'
Success: Updated 'elementor_checklist' option.
+ wp option set elementor_onboarded true
Success: Updated 'elementor_onboarded' option.
++ wp user list --field=ID
+ for id in $(wp user list --field=ID)
+ wp user meta add 1 announcements_user_counter 999
Success: Added custom field.
+ wp user meta add 1 elementor_onboarded 'a:1:{s:27:"ai-get-started-announcement";b:1;}'
Success: Added custom field.
+ wp cache flush
Success: The cache was flushed.
+ wp rewrite flush --hard
Success: Rewrite rules flushed.
+ wp help elementor
+ wp elementor flush-css
Success: Flushed the Elementor CSS Cache
+ wp plugin is-active woocommerce
+ echo 'WooCommerce is active - installing pages'
+ wp wc tool run install_pages --user=admin
WooCommerce is active - installing pages
Success: Updated system_status_tool install_pages.
+ '[' -f ./wp-content/plugins/hello-plus/tests/playwright/sample-data/sample_products_with_acf_meta.xml ']'
Importing sample data
+ echo 'Importing sample data'
+ wp import ./wp-content/plugins/hello-plus/tests/playwright/sample-data/sample_products_with_acf_meta.xml --authors=skip --quiet --allow-root
+ '[' -f ./wp-content/plugins/hello-plus/tests/playwright/sample-data/hello-plus-footer.xml ']'
+ echo 'Importing Hello Plus footer data'
<p>All done. <a href="http://localhost:8889/wp-admin/">Have fun!</a></p><p>Remember to update the passwords and roles of imported users.</p>Importing Hello Plus footer data
+ wp import ./wp-content/plugins/hello-plus/tests/playwright/sample-data/hello-plus-footer.xml --authors=skip --quiet --allow-root
✔ Ran `bash hello-plus-config/setup.sh` in 'tests-cli'. (in 25s 522ms)
<p>All done. <a href="http://localhost:8889/wp-admin/">Have fun!</a></p><p>Remember to update the passwords and roles of imported users.</p>Additional WooCommerce-specific setup...
ℹ Starting 'wp option update woocommerce_store_address 123 Test Street' on the cli container. 

Success: Updated 'woocommerce_store_address' option.
✔ Ran `wp option update woocommerce_store_address 123 Test Street` in 'cli'. (in 0s 965ms)
ℹ Starting 'wp option update woocommerce_store_city Test City' on the cli container. 

Success: Updated 'woocommerce_store_city' option.
✔ Ran `wp option update woocommerce_store_city Test City` in 'cli'. (in 0s 980ms)
ℹ Starting 'wp option update woocommerce_default_country US:CA' on the cli container. 

Success: Value passed for 'woocommerce_default_country' option is unchanged.
✔ Ran `wp option update woocommerce_default_country US:CA` in 'cli'. (in 0s 955ms)
ℹ Starting 'wp option update woocommerce_store_postcode 12345' on the cli container. 

Success: Updated 'woocommerce_store_postcode' option.
✔ Ran `wp option update woocommerce_store_postcode 12345` in 'cli'. (in 0s 973ms)
ℹ Starting 'wp option update woocommerce_currency USD' on the cli container. 

Success: Value passed for 'woocommerce_currency' option is unchanged.
✔ Ran `wp option update woocommerce_currency USD` in 'cli'. (in 0s 971ms)
ℹ Starting 'wp option update woocommerce_product_type both' on the cli container. 

Success: Updated 'woocommerce_product_type' option.
✔ Ran `wp option update woocommerce_product_type both` in 'cli'. (in 1s 30ms)
ℹ Starting 'wp option update woocommerce_allow_tracking no' on the cli container. 

Success: Value passed for 'woocommerce_allow_tracking' option is unchanged.
✔ Ran `wp option update woocommerce_allow_tracking no` in 'cli'. (in 0s 956ms)
ℹ Starting 'wp wc --user=admin tool run install_pages' on the cli container. 

Success: Updated system_status_tool install_pages.
✔ Ran `wp wc --user=admin tool run install_pages` in 'cli'. (in 0s 986ms)
Verifying active theme after setup...
ℹ Starting 'wp theme list --status=active --field=name' on the cli container. 

✔ Ran `wp theme list --status=active --field=name` in 'cli'. (in 2s 178ms)
Active theme: hello-biz
Correct theme active: hello-biz
35s
Run echo "Running Hello Plus setup script with WooCommerce configuration..."
Running Hello Plus setup script with WooCommerce configuration...
Executing setup script in wp-env container...
Setup script exit code: 0
Setup script output:
ℹ Starting 'bash /var/www/html/hello-plus-config/setup.sh' on the cli container. 

+ wp plugin install wordpress-importer --activate
Warning: wordpress-importer: Plugin already installed.
Activating 'wordpress-importer'...
Warning: Plugin 'wordpress-importer' is already active.
Success: Plugin already installed.
+ wp plugin activate elementor
Warning: Plugin 'elementor' is already active.
Success: Plugin already activated.
+ wp plugin activate woocommerce
Warning: Plugin 'woocommerce' is already active.
Success: Plugin already activated.
+ wp theme list --field=name
+ grep -q hello-commerce
+ wp theme list --field=name
+ grep -q hello-biz
Activating Hello Biz theme
+ echo 'Activating Hello Biz theme'
+ wp theme activate hello-biz
Warning: The 'Hello Biz' theme is already active.
+ wp plugin activate hello-plus
Warning: Plugin 'hello-plus' is already active.
Success: Plugin already activated.
+ wp plugin list --field=name
+ grep -q elementor-pro
+ echo 'Elementor Pro not installed - skipping deactivation'
+ WP_CLI_CONFIG_PATH=hello-plus-config/wp-cli.yml
+ wp rewrite structure /%postname%/ --hard
Elementor Pro not installed - skipping deactivation
Success: Rewrite structure set.
Success: Rewrite rules flushed.
+ wp user meta add admin wp_persisted_preferences 'a:2:{s:14:\"core/edit-post\";a:2:{b:1;s:12:\"welcomeGuide\";b:0;}}'
Success: Added custom field.
+ wp option update e_editor_counter 10
Success: Value passed for 'e_editor_counter' option is unchanged.
+ wp option update elementor_checklist '{"last_opened_timestamp":null,"first_closed_checklist_in_editor":true,"is_popup_minimized":false,"steps":[],"should_open_in_editor":false,"editor_visit_count":10}'
Success: Updated 'elementor_checklist' option.
+ wp option set elementor_onboarded true
Success: Value passed for 'elementor_onboarded' option is unchanged.
++ wp user list --field=ID
+ for id in $(wp user list --field=ID)
+ wp user meta add 1 announcements_user_counter 999
Success: Added custom field.
+ wp user meta add 1 elementor_onboarded 'a:1:{s:27:"ai-get-started-announcement";b:1;}'
Success: Added custom field.
+ wp cache flush
Success: The cache was flushed.
+ wp rewrite flush --hard
Success: Rewrite rules flushed.
+ wp help elementor
+ wp elementor flush-css
Success: Flushed the Elementor CSS Cache
+ wp plugin is-active woocommerce
WooCommerce is active - installing pages
+ echo 'WooCommerce is active - installing pages'
+ wp wc tool run install_pages --user=admin
Success: Updated system_status_tool install_pages.
Importing sample data
+ '[' -f ./wp-content/plugins/hello-plus/tests/playwright/sample-data/sample_products_with_acf_meta.xml ']'
+ echo 'Importing sample data'
+ wp import ./wp-content/plugins/hello-plus/tests/playwright/sample-data/sample_products_with_acf_meta.xml --authors=skip --quiet --allow-root
Product &#8220;V-Neck T-Shirt&#8221; already exists.<br />Product &#8220;Hoodie&#8221; already exists.<br />Product &#8220;Hoodie with Logo&#8221; already exists.<br />Product &#8220;T-Shirt Hebrew&#8221; already exists.<br />Product &#8220;Beanie&#8221; already exists.<br />Product &#8220;Belt&#8221; already exists.<br />Product &#8220;Cap&#8221; already exists.<br />Product &#8220;Sunglasses&#8221; already exists.<br />Product &#8220;Hoodie with Pocket&#8221; already exists.<br />Product &#8220;Hoodie with Zipper&#8221; already exists.<br />Product &#8220;Long Sleeve Tee&#8221; already exists.<br />Product &#8220;Polo&#8221; already exists.<br />Product &#8220;Album&#8221; already exists.<br />Product &#8220;Single&#8221; already exists.<br />Variations &#8220;V-Neck T-Shirt - Red&#8221; already exists.<br />Variations &#8220;V-Neck T-Shirt - Green&#8221; already exists.<br />Variations &#8220;V-Neck T-Shirt - Blue&#8221; already exists.<br />Variations &#8220;Hoodie - Red, No&#8221; already exists.<br />Variations &#8220;Hoodie - Green, No&#8221; already exists.<br />Variations &#8220;Hoodie - Blue, No&#8221; already exists.<br />Product &#8220;T-Shirt with Logo&#8221; already exists.<br />Product &#8220;Beanie with Logo&#8221; already exists.<br />Product &#8220;Logo Collection&#8221; already exists.<br />Product &#8220;WordPress Pennant&#8221; already exists.<br />Variations &#8220;Hoodie - Blue, Yes&#8221; already exists.<br />Media &#8220;vneck-tee-2.jpg&#8221; already exists.<br />Media &#8220;vnech-tee-green-1.jpg&#8221; already exists.<br />Media &#8220;vnech-tee-blue-1.jpg&#8221; already exists.<br />Media &#8220;hoodie-2.jpg&#8221; already exists.<br />Media &#8220;hoodie-blue-1.jpg&#8221; already exists.<br />Media &#8220;hoodie-green-1.jpg&#8221; already exists.<br />Media &#8220;hoodie-with-logo-2.jpg&#8221; already exists.<br />Media &#8220;tshirt-2.jpg&#8221; already exists.<br />Media &#8220;beanie-2.jpg&#8221; already exists.<br />Media &#8220;belt-2.jpg&#8221; already exists.<br />Media &#8220;cap-2.jpg&#8221; already exists.<br />Media &#8220;sunglasses-2.jpg&#8221; already exists.<br />Media &#8220;hoodie-with-pocket-2.jpg&#8221; already exists.<br />Media &#8220;hoodie-with-zipper-2.jpg&#8221; already exists.<br />Media &#8220;long-sleeve-tee-2.jpg&#8221; already exists.<br />Media &#8220;polo-2.jpg&#8221; already exists.<br />Media &#8220;album-1.jpg&#8221; already exists.<br />Media &#8220;single-1.jpg&#8221; already exists.<br />Media &#8220;t-shirt-with-logo-1.jpg&#8221; already exists.<br />Media &#8220;beanie-with-logo-1.jpg&#8221; already exists.<br />Media &#8220;logo-1.jpg&#8221; already exists.<br />Media &#8220;pennant-1.jpg&#8221; already exists.<br /><p>All done. <a href="http://localhost:8888/wp-admin/">Have fun!</a></p><p>Remember to update the passwords and roles of imported users.</p>Importing Hello Plus footer data
+ '[' -f ./wp-content/plugins/hello-plus/tests/playwright/sample-data/hello-plus-footer.xml ']'
+ echo 'Importing Hello Plus footer data'
+ wp import ./wp-content/plugins/hello-plus/tests/playwright/sample-data/hello-plus-footer.xml --authors=skip --quiet --allow-root
Template &#8220;Default Kit&#8221; already exists.<br />Template &#8220;Footer&#8221; already exists.<br /><p>All done. <a href="http://localhost:8888/wp-admin/">Have fun!</a></p><p>Remember to update the passwords and roles of imported users.</p>✔ Ran `bash /var/www/html/hello-plus-config/setup.sh` in 'cli'. (in 20s 117ms)
Hello Plus setup script completed successfully

=============================================
CRITICAL VERIFICATION: IMPORTED PRODUCTS
=============================================
Searching for 'Beanie with Logo' product...
Found 'Beanie with Logo' post with ID: 32
Verifying WooCommerce pricing meta for product 32...
Product meta verification:
   Regular Price (_regular_price): 20
   Sale Price (_sale_price): 18
   Current Price (_price): 18
   Stock Status (_stock_status): instock
   Product Type (_product_type): missing
Product has valid pricing (_price: 18) and stock status
Testing product URL accessibility...
Expected product URL: http://localhost:8888/product/beanie-with-logo/
Product slug: beanie-with-logo
Product slug is correct for URL routing
Total products imported: 18
Products successfully imported and verified
=============================================
PRODUCT VERIFICATION COMPLETE - ALL GOOD
=============================================

15s
Run echo "============================================="
=============================================
CRITICAL: CONFIGURING PERMALINKS AFTER IMPORT
=============================================
Setting WooCommerce-compatible permalink structure...
ℹ Starting 'bash -c WP_CLI_CONFIG_PATH=hello-plus-config/wp-cli.yml wp rewrite structure '/%postname%/' --hard' on the cli container. 

Success: Rewrite structure set.
Success: Rewrite rules flushed.
✔ Ran `bash -c WP_CLI_CONFIG_PATH=hello-plus-config/wp-cli.yml wp rewrite structure '/%postname%/' --hard` in 'cli'. (in 1s 691ms)
Verifying permalink structure...
Permalink structure: /%postname%/
Regenerating WooCommerce rewrite rules...
ℹ Starting 'wp rewrite flush --hard' on the cli container. 

Success: Rewrite rules flushed.
✔ Ran `wp rewrite flush --hard` in 'cli'. (in 0s 964ms)
Additional WooCommerce-specific rewrite flush...
ℹ Starting 'wp option update rewrite_rules ' on the cli container. 

Success: Updated 'rewrite_rules' option.
✔ Ran `wp option update rewrite_rules ` in 'cli'. (in 0s 974ms)
ℹ Starting 'wp rewrite flush --hard' on the cli container. 

Success: Rewrite rules flushed.
✔ Ran `wp rewrite flush --hard` in 'cli'. (in 0s 993ms)
Checking for WooCommerce product rewrite rules...
All rewrite rules:
ℹ Starting 'wp rewrite list' on the cli container. 

match	query	source
^wc-auth/v([1]{1})/(.*)?	index.php?wc-auth-version=$matches[1]&wc-auth-route=$matches[2]	other
^wc/file/transient/?$	index.php?wc-transient-file-name=	other
^wc/file/transient/(.+)$	index.php?wc-transient-file-name=$matches[1]	other
^wc-api/v([1-3]{1})/?$	index.php?wc-api-version=$matches[1]&wc-api-route=/	other
^wc-api/v([1-3]{1})(.*)?	index.php?wc-api-version=$matches[1]&wc-api-route=$matches[2]	other
shop/?$	index.php?post_type=product	other
shop/feed/(feed|rdf|rss|rss2|atom)/?$	index.php?post_type=product&feed=$matches[1]	other
shop/(feed|rdf|rss|rss2|atom)/?$	index.php?post_type=product&feed=$matches[1]	other
shop/page/([0-9]{1,})/?$	index.php?post_type=product&paged=$matches[1]	other
^wp-json/?$	index.php?rest_route=/	other
^wp-json/(.*)?	index.php?rest_route=/$matches[1]	other
^index.php/wp-json/?$	index.php?rest_route=/	other
^index.php/wp-json/(.*)?	index.php?rest_route=/$matches[1]	other
^wp-sitemap\.xml$	index.php?sitemap=index	other
✔ Ran `wp rewrite list` in 'cli'. (in 0s 990ms)
ℹ Starting 'wp rewrite list' on the cli container. 

✔ Ran `wp rewrite list` in 'cli'. (in 0s 993ms)
WooCommerce product rewrite rules found:
shop/?$	index.php?post_type=product	other
shop/feed/(feed|rdf|rss|rss2|atom)/?$	index.php?post_type=product&feed=$matches[1]	other
shop/(feed|rdf|rss|rss2|atom)/?$	index.php?post_type=product&feed=$matches[1]	other
shop/page/([0-9]{1,})/?$	index.php?post_type=product&paged=$matches[1]	other
brand/(.+?)/feed/(feed|rdf|rss|rss2|atom)/?$	index.php?product_brand=$matches[1]&feed=$matches[2]	product_brand
brand/(.+?)/(feed|rdf|rss|rss2|atom)/?$	index.php?product_brand=$matches[1]&feed=$matches[2]	product_brand
brand/(.+?)/embed/?$	index.php?product_brand=$matches[1]&embed=true	product_brand
brand/(.+?)/page/?([0-9]{1,})/?$	index.php?product_brand=$matches[1]&paged=$matches[2]	product_brand
brand/(.+?)/?$	index.php?product_brand=$matches[1]	product_brand
product-category/(.+?)/feed/(feed|rdf|rss|rss2|atom)/?$	index.php?product_cat=$matches[1]&feed=$matches[2]	product_cat
product-category/(.+?)/(feed|rdf|rss|rss2|atom)/?$	index.php?product_cat=$matches[1]&feed=$matches[2]	product_cat
product-category/(.+?)/embed/?$	index.php?product_cat=$matches[1]&embed=true	product_cat
product-category/(.+?)/page/?([0-9]{1,})/?$	index.php?product_cat=$matches[1]&paged=$matches[2]	product_cat
product-category/(.+?)/?$	index.php?product_cat=$matches[1]	product_cat
product-tag/([^/]+)/feed/(feed|rdf|rss|rss2|atom)/?$	index.php?product_tag=$matches[1]&feed=$matches[2]	product_tag
product-tag/([^/]+)/(feed|rdf|rss|rss2|atom)/?$	index.php?product_tag=$matches[1]&feed=$matches[2]	product_tag
product-tag/([^/]+)/embed/?$	index.php?product_tag=$matches[1]&embed=true	product_tag
product-tag/([^/]+)/page/?([0-9]{1,})/?$	index.php?product_tag=$matches[1]&paged=$matches[2]	product_tag
product-tag/([^/]+)/?$	index.php?product_tag=$matches[1]	product_tag
product/[^/]+/attachment/([^/]+)/?$	index.php?attachment=$matches[1]	product
product/[^/]+/attachment/([^/]+)/trackback/?$	index.php?attachment=$matches[1]&tb=1	product
product/[^/]+/attachment/([^/]+)/feed/(feed|rdf|rss|rss2|atom)/?$	index.php?attachment=$matches[1]&feed=$matches[2]	product
product/[^/]+/attachment/([^/]+)/(feed|rdf|rss|rss2|atom)/?$	index.php?attachment=$matches[1]&feed=$matches[2]	product
product/[^/]+/attachment/([^/]+)/comment-page-([0-9]{1,})/?$	index.php?attachment=$matches[1]&cpage=$matches[2]	product
product/[^/]+/attachment/([^/]+)/embed/?$	index.php?attachment=$matches[1]&embed=true	product
product/([^/]+)/embed/?$	index.php?product=$matches[1]&embed=true	product
product/([^/]+)/trackback/?$	index.php?product=$matches[1]&tb=1	product
product/([^/]+)/feed/(feed|rdf|rss|rss2|atom)/?$	index.php?product=$matches[1]&feed=$matches[2]	product
product/([^/]+)/(feed|rdf|rss|rss2|atom)/?$	index.php?product=$matches[1]&feed=$matches[2]	product
product/([^/]+)/page/?([0-9]{1,})/?$	index.php?product=$matches[1]&paged=$matches[2]	product
product/([^/]+)/comment-page-([0-9]{1,})/?$	index.php?product=$matches[1]&cpage=$matches[2]	product
product/([^/]+)/wc/file/transient(/(.*))?/?$	index.php?product=$matches[1]&wc/file/transient=$matches[3]	product
product/([^/]+)/wc-api(/(.*))?/?$	index.php?product=$matches[1]&wc-api=$matches[3]	product
product/[^/]+/([^/]+)/wc/file/transient(/(.*))?/?$	index.php?attachment=$matches[1]&wc/file/transient=$matches[3]	product
product/[^/]+/attachment/([^/]+)/wc/file/transient(/(.*))?/?$	index.php?attachment=$matches[1]&wc/file/transient=$matches[3]	product
product/[^/]+/([^/]+)/wc-api(/(.*))?/?$	index.php?attachment=$matches[1]&wc-api=$matches[3]	product
product/[^/]+/attachment/([^/]+)/wc-api(/(.*))?/?$	index.php?attachment=$matches[1]&wc-api=$matches[3]	product
product/([^/]+)(?:/([0-9]+))?/?$	index.php?product=$matches[1]&page=$matches[2]	product
product/[^/]+/([^/]+)/?$	index.php?attachment=$matches[1]	product
product/[^/]+/([^/]+)/trackback/?$	index.php?attachment=$matches[1]&tb=1	product
product/[^/]+/([^/]+)/feed/(feed|rdf|rss|rss2|atom)/?$	index.php?attachment=$matches[1]&feed=$matches[2]	product
product/[^/]+/([^/]+)/(feed|rdf|rss|rss2|atom)/?$	index.php?attachment=$matches[1]&feed=$matches[2]	product
product/[^/]+/([^/]+)/comment-page-([0-9]{1,})/?$	index.php?attachment=$matches[1]&cpage=$matches[2]	product
product/[^/]+/([^/]+)/embed/?$	index.php?attachment=$matches[1]&embed=true	product
Testing specific product URL accessibility...
Testing URL: http://localhost:8888/product/beanie-with-logo/
Checking URL resolution in WordPress...
URL resolution test result:
URL resolution test failed
=============================================
PERMALINK CONFIGURATION COMPLETE
=============================================
13s
Run echo "Verifying WordPress installation..."
Verifying WordPress installation...
ℹ Starting 'wp plugin list' on the cli container. 

name	status	update	version	update_version	auto_update
elementor	active	none	4.0.9		off
hello	inactive	none	1.7.2		off
hello-plus	active	none	1.7.8		off
woocommerce	active	none	10.7.0		off
wordpress-importer	active	none	0.9.5		off
✔ Ran `wp plugin list` in 'cli'. (in 1s 26ms)
ℹ Starting 'wp theme list' on the cli container. 

name	status	update	version	update_version	auto_update
hello-biz	active	none	1.2.2		off
twentyeleven	inactive	none	5.1		off
twentyfifteen	inactive	none	4.2		off
twentyfourteen	inactive	none	4.5		off
twentynineteen	inactive	none	3.3		off
twentyseventeen	inactive	none	4.1		off
twentysixteen	inactive	none	3.8		off
twentyten	inactive	none	4.6		off
twentythirteen	inactive	none	4.6		off
twentytwelve	inactive	none	4.8		off
twentytwenty	inactive	none	3.1		off
twentytwentyfive	inactive	none	1.5		off
twentytwentyfour	inactive	none	1.5		off
twentytwentyone	inactive	none	2.8		off
twentytwentythree	inactive	none	1.6		off
twentytwentytwo	inactive	none	2.1		off
✔ Ran `wp theme list` in 'cli'. (in 1s 956ms)
ℹ Starting 'wp core version' on the cli container. 

7.0
✔ Ran `wp core version` in 'cli'. (in 0s 348ms)
ℹ Starting 'wp --info' on the cli container. 

OS:	Linux 6.8.0-1052-azure #58~22.04.1-Ubuntu SMP Thu Mar 26 05:02:21 UTC 2026 x86_64
Shell:	
PHP binary:	/usr/local/bin/php
PHP version:	8.1.34
php.ini used:	/usr/local/etc/php/php.ini
MySQL binary:	/usr/bin/mariadb
MySQL version:	mariadb from 11.4.8-MariaDB, client 15.2 for Linux (x86_64) using readline 5.1
SQL modes:	
WP-CLI root dir:	phar://wp-cli.phar/vendor/wp-cli/wp-cli
WP-CLI vendor dir:	phar://wp-cli.phar/vendor
WP_CLI phar path:	phar:///usr/local/bin/wp
WP-CLI packages dir:	
WP-CLI cache dir:	/home/runner/.wp-cli/cache
WP-CLI global config:	
WP-CLI project config:	/var/www/html/wp-cli.yml
WP-CLI version:	2.12.0
✔ Ran `wp --info` in 'cli'. (in 0s 373ms)
Verifying WooCommerce setup...
WooCommerce version: 10.7.0
Products available: 18
Available products for testing:
ℹ Starting 'wp wc --user=admin product list --fields=id,name,slug,status,stock_status --format=table' on the cli container. 

Error: Invalid field: stock_status.
✖ Command failed with exit code 1
Command failed with exit code 1
Could not display product table
Testing beanie-with-logo product accessibility...
ℹ Starting 'wp post list --post_type=product --name=beanie-with-logo --field=post_title' on the cli container. 

Beanie with Logo
✔ Ran `wp post list --post_type=product --name=beanie-with-logo --field=post_title` in 'cli'. (in 0s 983ms)
40s
Run npx playwright install --with-deps chromium
Installing dependencies...
Switching to root user to install dependencies...
Get:1 file:/etc/apt/apt-mirrors.txt Mirrorlist [144 B]
Hit:2 http://azure.archive.ubuntu.com/ubuntu jammy InRelease
Hit:6 https://packages.microsoft.com/repos/azure-cli jammy InRelease
Get:7 https://packages.microsoft.com/ubuntu/22.04/prod jammy InRelease [3632 B]
Get:3 http://azure.archive.ubuntu.com/ubuntu jammy-updates InRelease [128 kB]
Get:4 http://azure.archive.ubuntu.com/ubuntu jammy-backports InRelease [127 kB]
Get:5 http://azure.archive.ubuntu.com/ubuntu jammy-security InRelease [129 kB]
Get:8 https://dl.google.com/linux/chrome-stable/deb stable InRelease [1825 B]
Get:9 https://packages.microsoft.com/ubuntu/22.04/prod jammy/main amd64 Packages [376 kB]
Get:10 https://packages.microsoft.com/ubuntu/22.04/prod jammy/main arm64 Packages [188 kB]
Get:11 http://azure.archive.ubuntu.com/ubuntu jammy-updates/main amd64 Packages [3523 kB]
Get:18 https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy InRelease [24.6 kB]
Get:12 http://azure.archive.ubuntu.com/ubuntu jammy-updates/main Translation-en [528 kB]
Get:13 http://azure.archive.ubuntu.com/ubuntu jammy-updates/restricted amd64 Packages [6001 kB]
Get:14 http://azure.archive.ubuntu.com/ubuntu jammy-updates/restricted Translation-en [1143 kB]
Get:15 http://azure.archive.ubuntu.com/ubuntu jammy-updates/universe amd64 Packages [1269 kB]
Get:16 http://azure.archive.ubuntu.com/ubuntu jammy-updates/multiverse amd64 Packages [71.6 kB]
Get:17 http://azure.archive.ubuntu.com/ubuntu jammy-updates/multiverse Translation-en [15.5 kB]
Get:19 http://azure.archive.ubuntu.com/ubuntu jammy-security/main amd64 Packages [3250 kB]
Get:20 http://azure.archive.ubuntu.com/ubuntu jammy-security/main Translation-en [457 kB]
Get:21 http://azure.archive.ubuntu.com/ubuntu jammy-security/restricted amd64 Packages [5781 kB]
Get:22 http://azure.archive.ubuntu.com/ubuntu jammy-security/restricted Translation-en [1103 kB]
Get:23 http://azure.archive.ubuntu.com/ubuntu jammy-security/universe amd64 Packages [1031 kB]
Get:27 https://dl.google.com/linux/chrome-stable/deb stable/main amd64 Packages [1221 B]
Get:24 http://azure.archive.ubuntu.com/ubuntu jammy-security/universe Translation-en [227 kB]
Get:25 http://azure.archive.ubuntu.com/ubuntu jammy-security/multiverse amd64 Packages [64.3 kB]
Get:26 http://azure.archive.ubuntu.com/ubuntu jammy-security/multiverse Translation-en [12.6 kB]
Get:28 https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy/main Translation-en [46.9 kB]
Fetched 25.5 MB in 4s (6699 kB/s)
Reading package lists...
Reading package lists...
Building dependency tree...
Reading state information...
fonts-liberation is already the newest version (1:1.07.4-11).
libatk-bridge2.0-0 is already the newest version (2.38.0-3).
libatk1.0-0 is already the newest version (2.36.0-3build1).
libatspi2.0-0 is already the newest version (2.44.0-3).
libfontconfig1 is already the newest version (2.13.1-4.2ubuntu5).
libfontconfig1 set to manually installed.
libxcb1 is already the newest version (1.14-3ubuntu3).
libxcb1 set to manually installed.
libxcomposite1 is already the newest version (1:0.4.5-1build2).
libxdamage1 is already the newest version (1:1.1.5-2build2).
libxext6 is already the newest version (2:1.3.4-1build1).
libxext6 set to manually installed.
libxfixes3 is already the newest version (1:6.0.0-1).
libxkbcommon0 is already the newest version (1.4.0-1).
libxrandr2 is already the newest version (2:1.5.2-1build1).
fonts-noto-color-emoji is already the newest version (2.047-0ubuntu0.22.04.1).
libasound2 is already the newest version (1.2.6.1-1ubuntu1.1).
libcairo2 is already the newest version (1.16.0-5ubuntu2.1).
libcups2 is already the newest version (2.4.1op1-1ubuntu4.16).
libcups2 set to manually installed.
libdbus-1-3 is already the newest version (1.12.20-2ubuntu4.1).
libdbus-1-3 set to manually installed.
libdrm2 is already the newest version (2.4.113-2~ubuntu0.22.04.1).
libfreetype6 is already the newest version (2.11.1+dfsg-1ubuntu0.3).
libfreetype6 set to manually installed.
libgbm1 is already the newest version (23.2.1-1ubuntu3.1~22.04.3).
libglib2.0-0 is already the newest version (2.72.4-0ubuntu2.9).
libglib2.0-0 set to manually installed.
libnspr4 is already the newest version (2:4.35-0ubuntu0.22.04.1).
libnss3 is already the newest version (2:3.98-0ubuntu0.22.04.3).
libpango-1.0-0 is already the newest version (1.50.6+ds-2ubuntu1).
libwayland-client0 is already the newest version (1.20.0-1ubuntu0.1).
libx11-6 is already the newest version (2:1.7.5-1ubuntu0.3).
libx11-6 set to manually installed.
xvfb is already the newest version (2:21.1.4-2ubuntu1.7~22.04.16).
The following additional packages will be installed:
  xfonts-encodings xfonts-utils
Recommended packages:
  fonts-ipafont-mincho fonts-tlwg-loma
The following NEW packages will be installed:
  fonts-freefont-ttf fonts-ipafont-gothic fonts-tlwg-loma-otf fonts-unifont
  fonts-wqy-zenhei xfonts-cyrillic xfonts-encodings xfonts-scalable
  xfonts-utils
0 upgraded, 9 newly installed, 0 to remove and 20 not upgraded.
Need to get 18.4 MB of archives.
After this operation, 56.8 MB of additional disk space will be used.
Get:1 file:/etc/apt/apt-mirrors.txt Mirrorlist [144 B]
Get:2 http://azure.archive.ubuntu.com/ubuntu jammy/universe amd64 fonts-ipafont-gothic all 00303-21ubuntu1 [3513 kB]
Get:3 http://azure.archive.ubuntu.com/ubuntu jammy/main amd64 fonts-freefont-ttf all 20120503-10build1 [2388 kB]
Get:4 http://azure.archive.ubuntu.com/ubuntu jammy/universe amd64 fonts-tlwg-loma-otf all 1:0.7.3-1 [107 kB]
Get:5 http://azure.archive.ubuntu.com/ubuntu jammy/universe amd64 fonts-unifont all 1:14.0.01-1 [3551 kB]
Get:6 http://azure.archive.ubuntu.com/ubuntu jammy/universe amd64 fonts-wqy-zenhei all 0.9.45-8 [7472 kB]
Get:7 http://azure.archive.ubuntu.com/ubuntu jammy/main amd64 xfonts-encodings all 1:1.0.5-0ubuntu2 [578 kB]
Get:8 http://azure.archive.ubuntu.com/ubuntu jammy/main amd64 xfonts-utils amd64 1:7.7+6build2 [94.6 kB]
Get:9 http://azure.archive.ubuntu.com/ubuntu jammy/universe amd64 xfonts-cyrillic all 1:1.0.5 [386 kB]
Get:10 http://azure.archive.ubuntu.com/ubuntu jammy/main amd64 xfonts-scalable all 1:1.0.3-1.2ubuntu1 [306 kB]
Fetched 18.4 MB in 0s (43.5 MB/s)
Selecting previously unselected package fonts-ipafont-gothic.
(Reading database ... 
(Reading database ... 5%
(Reading database ... 10%
(Reading database ... 15%
(Reading database ... 20%
(Reading database ... 25%
(Reading database ... 30%
(Reading database ... 35%
(Reading database ... 40%
(Reading database ... 45%
(Reading database ... 50%
(Reading database ... 55%
(Reading database ... 60%
(Reading database ... 65%
(Reading database ... 70%
(Reading database ... 75%
(Reading database ... 80%
(Reading database ... 85%
(Reading database ... 90%
(Reading database ... 95%
(Reading database ... 100%
(Reading database ... 268189 files and directories currently installed.)
Preparing to unpack .../0-fonts-ipafont-gothic_00303-21ubuntu1_all.deb ...
Unpacking fonts-ipafont-gothic (00303-21ubuntu1) ...
Selecting previously unselected package fonts-freefont-ttf.
Preparing to unpack .../1-fonts-freefont-ttf_20120503-10build1_all.deb ...
Unpacking fonts-freefont-ttf (20120503-10build1) ...
Selecting previously unselected package fonts-tlwg-loma-otf.
Preparing to unpack .../2-fonts-tlwg-loma-otf_1%3a0.7.3-1_all.deb ...
Unpacking fonts-tlwg-loma-otf (1:0.7.3-1) ...
Selecting previously unselected package fonts-unifont.
Preparing to unpack .../3-fonts-unifont_1%3a14.0.01-1_all.deb ...
Unpacking fonts-unifont (1:14.0.01-1) ...
Selecting previously unselected package fonts-wqy-zenhei.
Preparing to unpack .../4-fonts-wqy-zenhei_0.9.45-8_all.deb ...
Unpacking fonts-wqy-zenhei (0.9.45-8) ...
Selecting previously unselected package xfonts-encodings.
Preparing to unpack .../5-xfonts-encodings_1%3a1.0.5-0ubuntu2_all.deb ...
Unpacking xfonts-encodings (1:1.0.5-0ubuntu2) ...
Selecting previously unselected package xfonts-utils.
Preparing to unpack .../6-xfonts-utils_1%3a7.7+6build2_amd64.deb ...
Unpacking xfonts-utils (1:7.7+6build2) ...
Selecting previously unselected package xfonts-cyrillic.
Preparing to unpack .../7-xfonts-cyrillic_1%3a1.0.5_all.deb ...
Unpacking xfonts-cyrillic (1:1.0.5) ...
Selecting previously unselected package xfonts-scalable.
Preparing to unpack .../8-xfonts-scalable_1%3a1.0.3-1.2ubuntu1_all.deb ...
Unpacking xfonts-scalable (1:1.0.3-1.2ubuntu1) ...
Setting up fonts-wqy-zenhei (0.9.45-8) ...
Setting up fonts-freefont-ttf (20120503-10build1) ...
Setting up fonts-tlwg-loma-otf (1:0.7.3-1) ...
Setting up xfonts-encodings (1:1.0.5-0ubuntu2) ...
Setting up fonts-ipafont-gothic (00303-21ubuntu1) ...
update-alternatives: using /usr/share/fonts/opentype/ipafont-gothic/ipag.ttf to provide /usr/share/fonts/truetype/fonts-japanese-gothic.ttf (fonts-japanese-gothic.ttf) in auto mode
Setting up fonts-unifont (1:14.0.01-1) ...
Setting up xfonts-utils (1:7.7+6build2) ...
Setting up xfonts-cyrillic (1:1.0.5) ...
Setting up xfonts-scalable (1:1.0.3-1.2ubuntu1) ...

Running kernel seems to be up-to-date.

Services to be restarted:
 systemctl restart irqbalance.service
 systemctl restart php8.1-fpm.service

Service restarts being deferred:
 systemctl restart networkd-dispatcher.service

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
Downloading Chromium 139.0.7258.5 (playwright build v1181) from https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1181/chromium-linux.zip
|                                                                                |   0% of 172.5 MiB
|■■■■■■■■                                                                        |  10% of 172.5 MiB
|■■■■■■■■■■■■■■■■                                                                |  20% of 172.5 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 172.5 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 172.5 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 172.5 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 172.5 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 172.5 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 172.5 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 172.5 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 172.5 MiB
Chromium 139.0.7258.5 (playwright build v1181) downloaded to /home/runner/.cache/ms-playwright/chromium-1181
Downloading FFMPEG playwright build v1011 from https://cdn.playwright.dev/dbazure/download/playwright/builds/ffmpeg/1011/ffmpeg-linux.zip
|                                                                                |   0% of 2.3 MiB
|■■■■■■■■                                                                        |  10% of 2.3 MiB
|■■■■■■■■■■■■■■■■                                                                |  20% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 2.3 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 2.3 MiB
FFMPEG playwright build v1011 downloaded to /home/runner/.cache/ms-playwright/ffmpeg-1011
Downloading Chromium Headless Shell 139.0.7258.5 (playwright build v1181) from https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1181/chromium-headless-shell-linux.zip
|                                                                                |   0% of 104.8 MiB
|■■■■■■■■                                                                        |  10% of 104.8 MiB
|■■■■■■■■■■■■■■■■                                                                |  20% of 104.8 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 104.8 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 104.8 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 104.8 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 104.8 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 104.8 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 104.8 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 104.8 MiB
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 104.8 MiB
Chromium Headless Shell 139.0.7258.5 (playwright build v1181) downloaded to /home/runner/.cache/ms-playwright/chromium_headless_shell-1181
15m 3s
Run export DAILY_MATRIX_WORKFLOW=true
Running ALL Playwright tests with WooCommerce environment (Shard 2/2)...
Running ALL tests to verify complete Hello Plus + WooCommerce compatibility
Executing: npm run test:playwright -- --shard=2/2

> hello-plus@1.7.8 test:playwright
> playwright test -c tests/playwright/playwright.config.ts --shard=2/2


Running 18 tests using 2 workers, shard 2 of 2

  ✓  2 tests/playwright/tests/modules/forms/widget/forms-lite.test.ts:114:5 › Forms Lite widget can be added to the page (23.1s)
  ✓  3 tests/playwright/tests/modules/forms/widget/forms-lite.test.ts:121:5 › Forms Lite widget has default form fields (15.6s)
  ✓  4 tests/playwright/tests/modules/forms/widget/forms-lite.test.ts:143:5 › Forms Lite widget text content can be customized (11.2s)
  ✓  1 tests/playwright/tests/modules/template-parts/widgets/ehp-footer.test.ts:174:6 › Hello Plus Footer › Footer randomized configuration test 1 (46.7s)
  ✓  5 tests/playwright/tests/modules/forms/widget/forms-lite.test.ts:162:5 › Forms Lite widget form fields can be customized (19.3s)
  ✓  7 tests/playwright/tests/modules/forms/widget/forms-lite.test.ts:179:5 › Forms Lite widget button can be customized (15.0s)
  ✓  6 tests/playwright/tests/modules/template-parts/widgets/ehp-footer.test.ts:178:6 › Hello Plus Footer › Footer randomized configuration test 2 (41.8s)
  ✓  8 tests/playwright/tests/modules/forms/widget/forms-lite.test.ts:199:5 › Forms Lite widget style controls work correctly (39.3s)
  ✓  10 tests/playwright/tests/modules/template-parts/widgets/ehp-header-dropdown-hover.test.ts:30:6 › Hello Plus Header Dropdown Hover Behavior › Dropdown menu opens on hover and closes on mouse leave (15.1s)
  ✓  11 tests/playwright/tests/modules/template-parts/widgets/ehp-header-dropdown-hover.test.ts:154:6 › Hello Plus Header Dropdown Hover Behavior › Dropdown menu behavior with submenu hover (584ms)
  ✓  9 tests/playwright/tests/modules/template-parts/widgets/ehp-header-and-floating-bar.test.ts:34:6 › Hello Plus Header with Floating Bar › Hello Plus Header with Floating Bar (1.5m)
  ✓  12 tests/playwright/tests/modules/template-parts/widgets/ehp-header-dropdown-with-box-padding.test.ts:28:6 › Hello Plus Header Dropdown Box Padding styling › Box padding styling (16.7s)
  ✓  13 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:115:6 › Hello Plus Header › Assert that the dropdown button does not inherit the background color from the theme settings (48.1s)
  ✘  15 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test (1.3m)
  -  16 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:158:6 › Hello Plus Header › Header sticky behavior (advanced tab) test
  ✘  14 tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar (2.2m)
  ✓  17 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:115:6 › Hello Plus Header › Assert that the dropdown button does not inherit the background color from the theme settings (retry #1) (58.6s)
  ✘  18 tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar (retry #1) (2.3m)
  ✘  19 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test (retry #1) (1.2m)
  -  21 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:158:6 › Hello Plus Header › Header sticky behavior (advanced tab) test (retry #1)
  ✓  22 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:115:6 › Hello Plus Header › Assert that the dropdown button does not inherit the background color from the theme settings (retry #2) (1.0m)
  ✓  20 tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar (retry #2) (2.3m)
  ✘  23 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test (retry #2) (1.2m)
  -  25 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:158:6 › Hello Plus Header › Header sticky behavior (advanced tab) test (retry #2)
  ✓  26 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:115:6 › Hello Plus Header › Assert that the dropdown button does not inherit the background color from the theme settings (retry #3) (51.8s)
  ✓  24 tests/playwright/tests/modules/template-parts/widgets/floating-header.test.ts:36:6 › Hello Plus Floating Header › Hello Plus Floating Header (1.9m)
  ✓  28 tests/playwright/tests/woocommerce/woocommerce.test.ts:5:6 › Woocommerce compatibility tests › Verify that Woocommerce works with Hello Plus (6.4s)
  ✘  27 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test (retry #3) (1.1m)
  -  29 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:158:6 › Hello Plus Header › Header sticky behavior (advanced tab) test (retry #3)
  ✓  30 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:115:6 › Hello Plus Header › Assert that the dropdown button does not inherit the background color from the theme settings (retry #4) (31.6s)
  ✓  31 tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test (retry #4) (51.7s)
Error: Timed out waiting 900s for the test suite to run
Timed out waiting 900s for the test suite to run
Error: Timed out waiting 900s for the teardown for test suite to run
Timed out waiting 900s for the teardown for test suite to run
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-1-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-2-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-2-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:154:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-3-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-3-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:155:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      31737 pixels (ratio 0.21 of all image pixels) are different.

      Snapshot: header-config-1-frontend-tablet.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-tablet.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 31737 pixels (ratio 0.21 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 31737 pixels (ratio 0.21 of all image pixels) are different.


      59 | 	await expect
      60 | 		.soft( frontendWidget )
    > 61 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-tablet.png`, {
         | 		 ^
      62 | 			animations: 'disabled',
      63 | 			caret: 'hide',
      64 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:61:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-1-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-2-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-2-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:154:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-3-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-3-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:155:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #2 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-1-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #2 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-2-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-2-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:154:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #2 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-3-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-3-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:155:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #3 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      31737 pixels (ratio 0.21 of all image pixels) are different.

      Snapshot: header-config-1-frontend-tablet.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-tablet.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 31737 pixels (ratio 0.21 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 31737 pixels (ratio 0.21 of all image pixels) are different.


      59 | 	await expect
      60 | 		.soft( frontendWidget )
    > 61 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-tablet.png`, {
         | 		 ^
      62 | 			animations: 'disabled',
      63 | 			caret: 'hide',
      64 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:61:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #3 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-1-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #3 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-2-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-2-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:154:3
Error:   1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Retry #3 ───────────────────────────────────────────────────────────────────────────────────────
    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-3-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-3-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:155:3
Error:   2) tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar 
    Test timeout of 90000ms exceeded.
Error:   2) tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar 
    Error: page.goto: Target page, context or browser has been closed
    Call log:
      - navigating to "http://localhost:8888/wp-admin/profile.php", waiting until "load"


       at ../pages/wp-admin-page.ts:426

      424 | 	 */
      425 | 	async showAdminBar(): Promise<void> {
    > 426 | 		await this.page.goto( '/wp-admin/profile.php' );
          | 		                ^
      427 | 		await this.page.locator( '#admin_bar_front' ).check();
      428 | 		await this.page.locator( '#submit' ).click();
      429 | 	}
        at WpAdminPage.showAdminBar (/home/runner/work/hello-plus/hello-plus/tests/playwright/pages/wp-admin-page.ts:426:19)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:115:24
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:114:14
Error:   2) tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar 

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────
    Test timeout of 90000ms exceeded.
Notice:   2 flaky
    tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 
    tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar 
  1 did not run
  15 passed (15.0m)


  1) tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-1-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-2-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-2-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:154:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-3-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-3-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:155:3

    attachment #1: header-config-1-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-1-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/header-config-1-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/header-config-1-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: header-config-2-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-2-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/header-config-2-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/header-config-2-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #3: header-config-3-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-3-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/header-config-3-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/header-config-3-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/error-context.md

    attachment #5: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-template-parts-wid-fd989-ndomized-configuration-test/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(locator).toHaveScreenshot(expected)

      31737 pixels (ratio 0.21 of all image pixels) are different.

      Snapshot: header-config-1-frontend-tablet.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-tablet.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 31737 pixels (ratio 0.21 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 31737 pixels (ratio 0.21 of all image pixels) are different.


      59 | 	await expect
      60 | 		.soft( frontendWidget )
    > 61 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-tablet.png`, {
         | 		 ^
      62 | 			animations: 'disabled',
      63 | 			caret: 'hide',
      64 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:61:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-1-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-2-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-2-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:154:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-3-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-3-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:155:3

    attachment #1: header-config-1-frontend-tablet (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-1-frontend-tablet-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/header-config-1-frontend-tablet-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/header-config-1-frontend-tablet-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: header-config-1-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-1-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/header-config-1-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/header-config-1-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #3: header-config-2-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-2-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/header-config-2-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/header-config-2-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #4: header-config-3-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-3-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/header-config-3-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/header-config-3-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/error-context.md

    attachment #6: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #2 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-1-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-2-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-2-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:154:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-3-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-3-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:155:3

    attachment #1: header-config-1-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-1-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/header-config-1-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/header-config-1-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: header-config-2-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-2-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/header-config-2-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/header-config-2-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #3: header-config-3-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-3-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/header-config-3-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/header-config-3-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/error-context.md

    attachment #5: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry2/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #3 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(locator).toHaveScreenshot(expected)

      31737 pixels (ratio 0.21 of all image pixels) are different.

      Snapshot: header-config-1-frontend-tablet.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-tablet.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 31737 pixels (ratio 0.21 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 31737 pixels (ratio 0.21 of all image pixels) are different.


      59 | 	await expect
      60 | 		.soft( frontendWidget )
    > 61 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-tablet.png`, {
         | 		 ^
      62 | 			animations: 'disabled',
      63 | 			caret: 'hide',
      64 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:61:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-1-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-1-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-connect">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:153:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-2-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-2-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-center">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:154:3

    Error: expect(locator).toHaveScreenshot(expected)

      12418 pixels (ratio 0.23 of all image pixels) are different.

      Snapshot: header-config-3-frontend-mobile.png

    Call log:
      - Expect "soft toHaveScreenshot(header-config-3-frontend-mobile.png)" with timeout 5000ms
        - verifying given screenshot expectation
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - 12418 pixels (ratio 0.23 of all image pixels) are different.
      - waiting 100ms before taking screenshot
      - waiting for locator('.ehp-header')
        - locator resolved to <header data-behavior-float="no" data-scroll-behavior="scroll-up" data-responsive-breakpoint="tablet-portrait" class="ehp-header has-behavior-onscroll-scroll-up has-align-link-start">…</header>
      - taking element screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - attempting scroll into view action
        - waiting for element to be stable
      - captured a stable screenshot
      - 12418 pixels (ratio 0.23 of all image pixels) are different.


      68 | 	await expect
      69 | 		.soft( frontendWidget )
    > 70 | 		.toHaveScreenshot( `header-config-${ loopIndex + 1 }-frontend-mobile.png`, {
         | 		 ^
      71 | 			animations: 'disabled',
      72 | 			caret: 'hide',
      73 | 		} );
        at runHeaderConfigurationtest (/home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:70:4)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:155:3

    attachment #1: header-config-1-frontend-tablet (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-1-frontend-tablet-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/header-config-1-frontend-tablet-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/header-config-1-frontend-tablet-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: header-config-1-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-1-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/header-config-1-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/header-config-1-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #3: header-config-2-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-2-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/header-config-2-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/header-config-2-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #4: header-config-3-frontend-mobile (image/png) ─────────────────────────────────────
    Expected: tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts-snapshots/header-config-3-frontend-mobile-linux.png
    Received: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/header-config-3-frontend-mobile-actual.png
    Diff:     test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/header-config-3-frontend-mobile-diff.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/error-context.md

    attachment #6: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-template-parts-wid-fd989-ndomized-configuration-test-retry3/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  2) tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar 

    Test timeout of 90000ms exceeded.

    Error: page.goto: Target page, context or browser has been closed
    Call log:
      - navigating to "http://localhost:8888/wp-admin/profile.php", waiting until "load"


       at ../pages/wp-admin-page.ts:426

      424 | 	 */
      425 | 	async showAdminBar(): Promise<void> {
    > 426 | 		await this.page.goto( '/wp-admin/profile.php' );
          | 		                ^
      427 | 		await this.page.locator( '#admin_bar_front' ).check();
      428 | 		await this.page.locator( '#submit' ).click();
      429 | 	}
        at WpAdminPage.showAdminBar (/home/runner/work/hello-plus/hello-plus/tests/playwright/pages/wp-admin-page.ts:426:19)
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:115:24
        at /home/runner/work/hello-plus/hello-plus/tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:114:14

    Error Context: test-results/modules-template-parts-wid-ec26e-ng-Header-with-Floating-Bar/error-context.md

    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/modules-template-parts-wid-ec26e-ng-Header-with-Floating-Bar/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-template-parts-wid-ec26e-ng-Header-with-Floating-Bar/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Test timeout of 90000ms exceeded.

    Error Context: test-results/modules-template-parts-wid-ec26e-ng-Header-with-Floating-Bar-retry1/error-context.md

    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/modules-template-parts-wid-ec26e-ng-Header-with-Floating-Bar-retry1/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-template-parts-wid-ec26e-ng-Header-with-Floating-Bar-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  2 flaky
    tests/playwright/tests/modules/template-parts/widgets/ehp-header.test.ts:147:6 › Hello Plus Header › Header randomized configuration test 
    tests/playwright/tests/modules/template-parts/widgets/floating-header-and-floating-bar.test.ts:34:6 › Hello Plus Floating Header with Floating Bar › Hello Plus Floating Header with Floating Bar 
  1 did not run
  15 passed (15.0m)
  2 errors were not a part of any test, see above for details
Error: Process completed with exit code 1.
16s
13s
0s
0s
1s
