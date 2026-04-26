import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxCollectionKey} from '@src/types/onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';

const cacheKeys: OnyxCollectionKey[] = [ONYXKEYS.CACHED_IMAGE];

async function cacheAttachment(uri: string, headers: Record<string, string>): Promise<void> {
    try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isInternetReachable) {
            return;
        }

        const response = await fetch(uri, {headers});
        if (!response.ok) {
            throw new Error(`Failed to fetch attachment: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const base64 = `data:${response.headers.get('Content-Type') ?? 'image/jpeg'};base64,${arrayBufferToBase64(arrayBuffer)}`;
        const fileUri = `${FileSystem.cacheDirectory}${encodeURIComponent(uri)}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {encoding: FileSystem.EncodingType.Base64});
        Onyx.merge(ONYXKEYS.CACHED_IMAGE, {[uri]: fileUri});
    } catch (error) {
        Log.warn('Failed to cache attachment', {uri, error: (error as Error).message});
    }
}

async function getCachedAttachment(uri: string): Promise<string | null> {
    try {
        const cachedUris = await Onyx.get(ONYXKEYS.CACHED_IMAGE);
        const savedUri = cachedUris?.[uri];
        if (!savedUri) {
            return null;
        }
        const metadata = await FileSystem.getInfoAsync(savedUri);
        if (metadata.exists) {
            return savedUri;
        }
        return null;
    } catch (error) {
        Log.warn('Failed to get cached attachment', {uri, error: (error as Error).message});
        return null;
    }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export {cacheAttachment, getCachedAttachment};