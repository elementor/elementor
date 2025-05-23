<?php
namespace Elementor\App\Modules\ImportExport;

use Elementor\Modules\CloudLibrary\Render_Mode_Preview_Base;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Render_Mode_Kit_Thumbnail extends Render_Mode_Preview_Base {
    const MODE = 'kit-thumbnail';

    protected $kit_id;

    public function __construct( $kit_id ) {
        $this->kit_id = $kit_id;
    }

    public function get_permissions_callback()
    {
        return true;
    }

    public static function get_name() {
        return self::MODE;
    }

	public function get_config() {
		return [
			'selector' => '.elementor',
			'home_url' => home_url(),
			'kit_id' => $this->kit_id,
		];
	}
}
