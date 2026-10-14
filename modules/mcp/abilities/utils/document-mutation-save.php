<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Mutation_Save {

	/**
	 * @return Document|\WP_Error
	 */
	public static function elements_preserving_live_status(
		Document_Mutator $mutator,
		Document $document,
		array $elements
	) {
		$result = $mutator->save_as_draft( $document, $elements, true );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( ! $result instanceof Document ) {
			return new \WP_Error(
				'elementor_save_failed',
				__( 'Could not save document.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return $result;
	}
}
