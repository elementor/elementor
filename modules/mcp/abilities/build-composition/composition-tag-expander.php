<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A composition tag that stands for elements built by a module, not for a registered element type.
 * The compiler keeps the tag as a leaf placeholder, and the expander replaces it with its elements before
 * the appliers run. Its `element_config` entry belongs to the expander.
 *
 * @internal Registered through `Tag_Expanders::FILTER`; the contract may still change.
 */
interface Composition_Tag_Expander {
	public function get_tag(): string;

	/**
	 * A Pro features discovery error when this instance can't be added: the compiler skips it and builds the rest.
	 */
	public function get_unavailable_error( array $config ): ?\WP_Error;

	/**
	 * Replaces each placeholder in `$config_id_index` with its elements. New configuration-ids may be added to
	 * the index, so the other appliers configure the new elements.
	 *
	 * @param array<string, array&> $config_id_index       Index of subtree refs.
	 * @param array<string, array>  $placeholders          Configuration-id => its `element_config` entry.
	 * @param string[]              $referenced_config_ids Every configuration-id used as a key in the input maps.
	 *
	 * @return array{error: ?\WP_Error, warnings: Warnings_Bag}
	 */
	public function expand( array &$config_id_index, array $placeholders, array $referenced_config_ids ): array;
}
