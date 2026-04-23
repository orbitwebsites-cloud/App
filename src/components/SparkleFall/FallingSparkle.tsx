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

    const frameCallback = useFrameCallback(({timeSinceFirstFrame}) => {
        const time = timeSinceFirstFrame / SPEED;

        translateY.set(initialPosition.y + initialVelocity.y * time + (1 / 2) * GRAVITY * time ** 2);
        translateX.set(translateX.get() + initialVelocity.x * time);
    }, false);

    useEffect(() => {
        setTimeout(() => {
            frameCallback.setActive(true);
            setTimeout(() => {
                frameCallback.setActive(false);
            }, 5000);
        }, delay);
    }, [initialPosition, delay, frameCallback]);

    const style = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.get()}, {translateY: translateY.get()}],
    }));

    return (
        <Animated.View style={[style, {position: 'absolute'}]}>
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
