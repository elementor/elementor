<?php

namespace Elementor\Modules\DynamicAssetsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Hooks {

	public const ACTION_REGISTER = 'elementor/assets/dynamic/register';

	public const FILTER_CLIENT_ASSET_MAP = 'elementor/assets/dynamic/client_asset_map';

	public const FILTER_SCAN_DOCUMENT_TYPES = 'elementor/assets/dynamic/scan_document_types';

	public const FILTER_ENQUEUE_HANDLES = 'elementor/assets/dynamic/enqueue_handles_before_send';

	public const FILTER_SKIP_ZERO_USAGE = 'elementor/assets/dynamic/skip_zero_usage';

	public const SCRIPT_HANDLE = 'e_lazy_dynamic_assets_preview';
}
