import {useEffect, useState} from 'react';
import {CacheManager} from 'expo-image';
import * as FileSystem from 'expo-file-system';
import type {ImageSource} from 'expo-image';
import * as Network from 'expo-network';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxCollectionKey} from '@src/types/onyx';
import Onyx from 'react-native-onyx';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';

type CacheStatus = {
    isLoading: boolean;
    error: Error | null;
    source: ImageSource | null;
};

const cacheKeys: OnyxCollectionKey[] = [ONYXKEYS.CACHED_IMAGE];

const useCachedImageSource = (uri: string | null | undefined, headers: Record<string, string> = {}): CacheStatus => {
    const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
        isLoading: false,
        error: null,
        source: null,
    });

    useEffect(() => {
        if (!uri) {
            setCacheStatus({
                isLoading: false,
                error: null,
                source: null,
            });
            return;
        }

        let isMounted = true;

        const fetchAndCacheImage = async () => {
            try {
                setCacheStatus({
                    isLoading: true,
                    error: null,
                    source: {uri},
                });

                const networkState = await Network.getNetworkStateAsync();
                if (networkState.isInternetReachable) {
                    try {
                        const response = await fetch(uri, {headers});
                        if (!response.ok) {
                            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
                        }
                        const arrayBuffer = await response.arrayBuffer();
                        const base64 = `data:${response.headers.get('Content-Type') ?? 'image/jpeg'};base64,${arrayBufferToBase64(arrayBuffer)}`;
                        const fileUri = `${FileSystem.cacheDirectory}${encodeURIComponent(uri)}`;
                        await FileSystem.writeAsStringAsync(fileUri, base64, {encoding: FileSystem.EncodingType.Base64});
                        Onyx.merge(ONYXKEYS.CACHED_IMAGE, {[uri]: fileUri});
                        if (!isMounted) return;
                        setCacheStatus({
                            isLoading: false,
                            error: null,
                            source: {uri: fileUri},
                        });
                        return;
                    } catch (error) {
                        Log.warn('Failed to fetch and cache image online, falling back to local cache', {uri, error: (error as Error).message});
                    }
                }

                const cachedUri = await Onyx.get(ONYXKEYS.CACHED_IMAGE);
                const savedUri = cachedUri?.[uri];
                if (savedUri) {
                    const metadata = await FileSystem.getInfoAsync(savedUri);
                    if (metadata.exists) {
                        if (!isMounted) return;
                        setCacheStatus({
                            isLoading: false,
                            error: null,
                            source: {uri: savedUri},
                        });
                        return;
                    }
                }

                if (!networkState.isInternetReachable) {
                    throw new Error('No internet connection and no cached image available');
                }
            } catch (error) {
                if (!isMounted) return;
                setCacheStatus({
                    isLoading: false,
                    error: error instanceof Error ? error : new Error('Unknown error occurred'),
                    source: {uri},
                });
            }
        };

        fetchAndCacheImage();

        return () => {
            isMounted = false;
        };
    }, [uri, headers]);

    return cacheStatus;
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export default useCachedImageSource;