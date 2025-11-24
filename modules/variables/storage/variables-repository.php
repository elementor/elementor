<?php

namespace Elementor\Modules\Variables\Storage;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\Utils;

class Variables_Repository {
	private const VARIABLES_META_KEY = '_elementor_global_variables';

	private Kit $kit;

	public function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public function load(): Variables_Collection {
		$db_record = $this->kit->get_json_meta( self::VARIABLES_META_KEY );

		if ( is_array( $db_record ) && ! empty( $db_record ) ) {
			// before send load process thru adapter ( value -> string ) // work with collection in adapter
			return Variables_Collection::hydrate( $db_record );
		}

		return Variables_Collection::default();
	}

	public function save( Variables_Collection $variables ) {
		$variables->increment_watermark();
		$record = $variables->serialize();
		// before save process thru adapter ( value -> prop value ) // work with collection in adapter

		if ( $this->kit->update_json_meta( static::VARIABLES_META_KEY, $record ) ) {
			return $variables->watermark();
		}

		return false;
	}
}
