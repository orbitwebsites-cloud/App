import React, {useEffect, useState} from 'react';
import {ImageSource} from 'expo-image';
import ImageRenderer from './ImageRenderer';
import useCachedImageSource from '@hooks/useCachedImageSource';
import type {BaseImageProps} from './types';

function BaseImage({source, style, resizeMode, alt, onError, onLoad, isAuthTokenRequired, headers = {}}: BaseImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const {isLoading, error, source: cachedSource} = useCachedImageSource(isAuthTokenRequired ? source?.uri : undefined, headers);

    useEffect(() => {
        if (!isAuthTokenRequired) {
            setIsLoaded(true);
        }
    }, [isAuthTokenRequired]);

    useEffect(() => {
        if (error) {
            onError?.(error);
        } else if (!isLoading && cachedSource && !error) {
            setIsLoaded(true);
            onLoad?.();
        }
    }, [isLoading, error, cachedSource, onLoad, onError]);

    const finalSource = isAuthTokenRequired ? cachedSource : source;

    return (
        <ImageRenderer
            source={finalSource ?? source}
            style={style}
            resizeMode={resizeMode}
            alt={alt}
            isLoaded={isLoaded}
        />
    );
}

BaseImage.displayName = 'BaseImage';

export default BaseImage;