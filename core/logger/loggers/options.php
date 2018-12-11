<?php

namespace Elementor\Core\Logger\Loggers;

use Elementor\Core\Logger\Items\Log_Item_Interface as Log_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Options extends Base {

	const OPTION_NAME = 'elementor_log';

	public function save_log( Log_Item $item ) {
		/** @var Log_Item[] $log */
		$log = get_option( self::OPTION_NAME, [] );

		$id = $item->get_fingerprint();

		if ( empty( $log[ $id ] ) ) {
			$log[ $id ] = $item;
		}

		$log[ $id ]->increase_times( $item );


		update_option( self::OPTION_NAME, $log, 'no' );
	}

	public function get_formatted_log_entries() {
		$entries = get_option( self::OPTION_NAME, [] );
		$formatted_entries = [];
		foreach ( $entries as $entry ) {
			/** @var Log_Item $entry */
//			$formatted_entries[ $entry->get_name() ][] = $entry->format();
			$formatted_entries[] = $entry->format();
		}
		return $formatted_entries;
	}
}
