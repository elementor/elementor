<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Id_Setting_Adapter extends Number_Setting_Adapter {

	const CONTROL_TYPE = 'query';

	const MIN_POST_ID = 1;

	public function __construct() {
		parent::__construct( true );
	}

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		return V3_Number_Prop_Type::make()->range( self::MIN_POST_ID, null )->whole();
	}
}
