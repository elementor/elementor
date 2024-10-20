import { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import useImageActions from '../../hooks/use-image-actions';
import { useEditImage } from '../../context/edit-image-context';
import usePromptSettings, { IMAGE_BACKGROUND_COLOR, IMAGE_RATIO } from '../../hooks/use-prompt-settings';
import { useRequestIds } from '../../../../context/requests-ids';
import ImageRatioSelect from '../../components/image-ratio-select';
import ColorInput from '../../components/color-picker';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import GenerateSubmit from '../../components/generate-submit';
import ImagesDisplay from '../../components/images-display';
import ProductImage from './components/product-image';

const ProductImageUnification = () => {
	const { setGenerate } = useRequestIds();
	const { editImage: products } = useEditImage();
	const { settings, updateSettings } = usePromptSettings( );
	const [ productsData, setProductsData ] = useState( );
	const [ data, setData ] = useState( [] );
	const [ send, setSend ] = useState( [] );
	const [ isGenerating, setIsGenerating ] = useState( false );
	const [ error, setError ] = useState( false );
	const { use, edit, isLoading: isUploading } = useImageActions();
	const isLoading = isGenerating || isUploading;
	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ settings ] );
	const generatedBgColor = useMemo( () => settings[ IMAGE_BACKGROUND_COLOR ], [ settings ] );
	const onProductUpdate = useCallback( ( res, isLoadingResult, errorGenerating, req, productId, ratio, bgColor, image ) => {
		setProductsData( ( prevState ) => ( { ...prevState, [ productId ]: {
			productId,
			res,
			isLoadingResult,
			errorGenerating,
			req: ( () => req( {
				postId: productId,
				settings: {
					[ IMAGE_RATIO ]: ratio,
					[ IMAGE_BACKGROUND_COLOR ]: bgColor,
				},
				image,
			} ) ) } } ) );
	}, [] );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		send.forEach( ( req ) => req() );
	};

	useEffect( () => {
		if ( ! productsData ) {
			return;
		}

		const newData = Object.values( productsData ).map( ( { res } ) => res );
		const newSend = Object.values( productsData ).map( ( { req } ) => req );
		const newIsGenerating = Object.values( productsData ).some( ( { isLoadingResult } ) => isLoadingResult );
		const newError = Object.values( productsData ).every( ( { errorGenerating } ) => errorGenerating );

		setData( ( prevData ) => {
			return JSON.stringify( prevData ) !== JSON.stringify( newData ) ? newData : prevData;
		} );

		setSend( ( prevSend ) => {
			return JSON.stringify( prevSend ) !== JSON.stringify( newSend ) ? newSend : prevSend;
		} );

		setIsGenerating( ( prevIsGenerating ) => {
			return prevIsGenerating !== newIsGenerating ? newIsGenerating : prevIsGenerating;
		} );

		setError( ( prevError ) => {
			return prevError !== newError ? newError : prevError;
		} );
	}, [ productsData ] );

	const getCols = ( dataLength = 1 ) => {
		return Math.min( Math.ceil( Math.sqrt( dataLength ?? 1 ) ), 4 );
	};

	return (
		<View>
			<View.Panel>
				<View.PanelHeading
					primary={ __( 'Unify images', 'elementor' ) }
					secondary={ __( 'Select a set of parameters and AI will automate your adjustments:', 'elementor' ) }
				/>
				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }
				<ImageForm onSubmit={ handleSubmit }>
					<Stack gap={ 2 } sx={ { my: 2.5 } }>
						<ColorInput
							label={ __( 'Background Color', 'elementor' ) }
							color={ generatedBgColor }
							onChange={ ( color ) => updateSettings( { [ IMAGE_BACKGROUND_COLOR ]: color } ) }
						/>
						<ImageRatioSelect
							disabled={ isLoading }
							value={ generatedAspectRatio }
							onChange={ ( event ) => updateSettings( { [ IMAGE_RATIO ]: event.target.value } ) }
						/>
						<Stack gap={ 2 } sx={ { my: 2.5 } }>
							{
								data?.result ? (
									<GenerateAgainSubmit disabled={ isLoading } />
								) : (
									<GenerateSubmit disabled={ isLoading } />
								)
							}
						</Stack>
					</Stack>

				</ImageForm>
			</View.Panel>
			<View.Content isGenerating={ isLoading }>
				{
					data?.result ? (
						<ImagesDisplay
							images={ data.result }
							onUseImage={ use }
							onEditImage={ edit }
							cols={ getCols( data.result?.length ) }
						/>
					) : (
						<ImagesDisplay
							images={ products.images }
							cols={ getCols( products.images?.length ?? 1 ) }
						/>
					)
				}
			</View.Content>
			{ products.images
				?.filter( ( img ) => img.product_id )
				.map( ( ( img ) => <ProductImage key={ `product-${ img.product_id }` }
					productId={ img.product_id }
					ratio={ settings[ IMAGE_RATIO ] }
					bgColor={ settings[ IMAGE_BACKGROUND_COLOR ] }
					image={ img }
					onUpdate={ onProductUpdate } /> ) ) }
		</View>
	);
};

export default ProductImageUnification;
