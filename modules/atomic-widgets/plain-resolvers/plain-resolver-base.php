<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Converts a plain LLM-supplied value into a form the walker can attach to a `Prop_Type` tree.
 *
 * Implementations MAY return either:
 * - A **raw value** (scalar or shape-only array) — leaves like `String`, `Number`, `Size`, `Html_V3`
 *   do this. `Plain_Values_Resolver::normalize_resolver_output` will wrap the result with
 *   `Prop_Type::generate()` to produce the `{ $$type, value }` envelope.
 * - A **fully-formed envelope** (`[ '$$type' => ..., 'value' => ... ]`) — composite resolvers like
 *   `Dynamic` and `Global_Variable` do this when the resolver alone knows the exact key/shape and
 *   short-circuits the walker (mirroring CSS value-parsers on the styles side).
 *
 * Return `null` to signal that the input can't be resolved for this prop type; the walker will
 * treat it as a skip (or drop the field from the parent object/array).
 */
abstract class Plain_Resolver_Base {
	abstract public function resolve( $plain_value );
}
