export class GenerateAiVariation extends $e.modules.CommandBase {
	apply( args ) {
		return this.component.insertTemplate( args );
	}
}

