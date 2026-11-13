<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Components\Documents\Component as Component_Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Staging {

	public static function is_live( Document $document ): bool {
		return in_array( get_post_status( $document->get_main_id() ), Document_Mutator::LIVE_STATUSES, true );
	}

	public static function is_staged_write( Document $written ): bool {
		$post = $written->get_post();

		return $post && (int) $post->ID !== (int) $written->get_main_id();
	}

	public static function draft_copy_message( Document $document ): string {
		if ( $document instanceof Component_Document ) {
			return __( 'Changes saved to a draft copy of the component. Pages using it are unchanged until you call elementor/manage-component with action=publish.', 'elementor' );
		}

		return __( 'Changes saved to a draft copy. The live page is unchanged until you call elementor/publish-document.', 'elementor' );
	}

	public static function schema_property(): array {
		return [
			'type' => 'boolean',
			'description' => 'True when the change was written to a draft copy of a published document and still needs publishing to go live.',
		];
	}
}
