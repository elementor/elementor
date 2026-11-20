<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Gallery_Item_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'v3-gallery-item';
	}

	protected function define_shape(): array {
		return [
			'id' => V3_Attachment_Id_Prop_Type::make()->required()->description( 'Media Library attachment ID (see elementor/list-assets).' ),
			'url' => Url_Prop_Type::make(),
		];
	}
}
