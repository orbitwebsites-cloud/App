import type {NavigationRef} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {StackActions} from '@react-navigation/native';
import {CommonActions} from '@react-navigation/native';

let navigationRef: RefObject<NavigationRef> = {current: null};
let navigationReady = false;

// We need to keep track of the top-level route name to determine whether we should reset the navigation state
let currentTopRouteName = '';

const navigation = {
    navigate: (name: string, params?: Record<string, unknown>) => {
        if (!navigationReady) {
            // If navigation is not ready yet, we'll store the route name and params
            // and navigate to it once the navigation is ready
            navigationRef.current?.dispatch(
                CommonActions.navigate({
                    name,
                    params,
                }),
            );
            return;
        }

        // When navigating, update the current top route name
        if (name) {
            currentTopRouteName = name;
        }

        navigationRef.current?.navigate(name, params);
    },

    goBack: () => {
        // Prevent going back if we're already at the top-level route
        if (navigationRef.current?.canGoBack()) {
            navigationRef.current?.goBack();
        }
    },

    reset: (routes: Array<{name: string; params?: Record<string, unknown>}>) => {
        const lastRoute = routes[routes.length - 1];
        if (lastRoute?.name) {
            currentTopRouteName = lastRoute.name;
        }

        navigationRef.current?.dispatch(
            CommonActions.reset({
                index: routes.length - 1,
                routes,
            }),
        );
    },

    dispatch: (action: unknown) => {
        navigationRef.current?.dispatch(action);
    },

    setNavigationRef: (ref: RefObject<NavigationRef>) => {
        navigationRef = ref;
    },

    setNavigationReady: () => {
        navigationReady = true;
    },

    isNavigationReady: (): boolean => navigationReady,

    // Returns the current top-level route name
    getTopRouteName: (): string => currentTopRouteName,

    // Sets the current top-level route name
    setTopRouteName: (name: string) => {
        currentTopRouteName = name;
    },

    // Handles leaving a report and navigating back safely
    leaveReport: (reportID: string) => {
        // First, leave the report
        navigation.dispatch(StackActions.pop());

        // Then navigate back to the main screen, but avoid infinite loops
        // by checking if we're already on the home screen
        setTimeout(() => {
            if (currentTopRouteName !== 'Home') {
                navigation.navigate('Home');
            }
        }, 100);
    },
};

export default navigation;