<?php
// /props-resolver/transformers/settings/motion-effects-data-transformer.php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;


if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Interactions_Transformer extends Transformer_Base {

    public function transform($value, Props_Resolver_Context $context) {

        // Return data attribute for JavaScript to pick up
        return [
            'data-interactions' => json_encode($value)
        ];
    }
}