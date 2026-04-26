import type {ImageSource} from 'expo-image';
import type Session from '@src/types/onyx/Session';

type GetImageSourceParams = {
    propsSource: ImageSource;
    session: Session | null;
    isAuthTokenRequired?: boolean;
    authTokenType?: string;
    authToken?: string;
};

function getImageSource({propsSource, session, isAuthTokenRequired = false, authTokenType = '', authToken = ''}: GetImageSourceParams): {
    source: ImageSource;
    headers: Record<string, string>;
    isAuthTokenRequired: boolean;
} {
    const source = {...propsSource};
    const headers: Record<string, string> = {};

    if (!isAuthTokenRequired || !authToken) {
        return {source, headers, isAuthTokenRequired: false};
    }

    headers[authTokenType] = authToken;
    isAuthTokenRequired = true;

    return {source, headers, isAuthTokenRequired};
}

export default getImageSource;