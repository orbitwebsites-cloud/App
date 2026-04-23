import React, {useEffect} from 'react';
import Animated, {useAnimatedStyle, useFrameCallback, useSharedValue} from 'react-native-reanimated';
import Icon from '@components/Icon';
import type IconAsset from '@src/types/utils/IconAsset';

type FallingSparkleData = {
    initialPosition: {
        x: number;
        y: number;
    };
    initialVelocity: {
        x: number;
        y: number;
    };
    color: string;
    delay: number;
};

type FallingSparkleProps = FallingSparkleData & {
    iconSrc: IconAsset;
};

const GRAVITY = 30;
const SPEED = 100;

function FallingSparkle({initialPosition, initialVelocity, color, delay, iconSrc}: FallingSparkleProps) {
    const translateX = useSharedValue<number>(initialPosition.x);
    const translateY = useSharedValue<number>(initialPosition.y);

    // Standard ballistic trajectory equations
    const frameCallback = useFrameCallback(({timeSinceFirstFrame}) => {
        const time = timeSinceFirstFrame / SPEED;

        translateY.set(initialPosition.y + initialVelocity.y * time + (1 / 2) * GRAVITY * time ** 2);
        translateX.set(initialPosition.x + initialVelocity.x * time);
    }, false);

    // Start animating after configured delay; stop frame callback after 5 seconds (should be plenty of time)
    useEffect(() => {
        let stopTimer: ReturnType<typeof setTimeout> | undefined;
        const startTimer = setTimeout(() => {
            frameCallback.setActive(true);
            stopTimer = setTimeout(() => {
                frameCallback.setActive(false);
            }, 5000);
        }, delay);

        return () => {
            clearTimeout(startTimer);
            if (stopTimer) {
                clearTimeout(stopTimer);
            }
            frameCallback.setActive(false);
        };
    }, [delay, frameCallback]);

    const style = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.get()}, {translateY: translateY.get()}],
        position: 'absolute',
    }));

    return (
        <Animated.View style={style}>
            <Icon
                fill={color}
                src={iconSrc}
                large
            />
        </Animated.View>
    );
}

export default FallingSparkle;
export type {FallingSparkleData, FallingSparkleProps};
