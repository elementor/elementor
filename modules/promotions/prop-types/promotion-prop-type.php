<?php
namespace Elementor\Modules\Promotions\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Promotion_Prop_Type extends Array_Prop_Type {

	private string $key;

	public function __construct( string $key = 'promotion' ) {
		$this->key = $key;
		parent::__construct();
	}

	public static function make( string $key = 'promotion' ): self {
		return new static( $key );
	}

	public static function get_key(): string {
		return 'promotion';
	}

	public function jsonSerialize(): array {
		$data = parent::jsonSerialize();
		$data['key'] = $this->key;

		return $data;
	}

	protected function define_item_type(): Prop_Type {
		return String_Prop_Type::make();
	}
}
