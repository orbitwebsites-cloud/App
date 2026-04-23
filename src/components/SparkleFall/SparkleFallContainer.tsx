import React, {useCallback, useImperativeHandle, useState} from 'react';
import type {Ref} from 'react';
import {Dimensions, View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import colors from '@styles/theme/colors';
import FallingSparkle from './FallingSparkle';
import type {FallingSparkleData} from './FallingSparkle';

type SparkleWithKeyId = FallingSparkleData & {id: number};

type SparkleFallHandle = {
    trigger: () => void;
};

const VX_SPREAD = 3;
const VY_SPREAD = 50;
const DELAY_SPREAD = 500;
const DELAY_MULTIPLIER = 0.1;
const X0_SPREAD = 0;
const SCREEN_HEIGHT_DENOMINATOR = 4.5;
const SPARKLE_COUNT = 80;
const COLORS = [colors.ice300, colors.ice400, colors.ice500];
const createSparkles = (count: number): SparkleWithKeyId[] => {
    const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

    return Array.from({length: count}, (_, index) => ({
        id: index,
        initialPosition: {x: screenWidth / 2 + (Math.random() * X0_SPREAD - X0_SPREAD / 2), y: screenHeight},
        initialVelocity: {
            x: Math.random() * VX_SPREAD - VX_SPREAD / 2,
            y: -(screenHeight / SCREEN_HEIGHT_DENOMINATOR) + Math.random() * VY_SPREAD - VY_SPREAD / 2,
        },
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: index * DELAY_MULTIPLIER + (-DELAY_SPREAD / 2 + Math.random() * DELAY_SPREAD),
    }));
};

type SparkleFallContainerProps = {
    ref?: Ref<SparkleFallHandle>;
};

function SparkleFallContainer({ref}: SparkleFallContainerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);
    const [sparkles, setSparkles] = useState<SparkleWithKeyId[]>([]);
    const [animKey, setAnimKey] = useState(0);

    const trigger = useCallback(() => {
        setAnimKey((prev) => prev + 1);
        setSparkles(createSparkles(SPARKLE_COUNT));
    }, []);

    useImperativeHandle(ref, () => ({trigger}), [trigger]);

    return (
        <View
            style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100}}
            pointerEvents="none"
        >
            {sparkles.map((sparkle) => (
                <FallingSparkle
                    delay={sparkle.delay}
                    key={`${sparkle.id}-${animKey}`}
                    iconSrc={icons.Sparkles}
                    initialPosition={sparkle.initialPosition}
                    initialVelocity={sparkle.initialVelocity}
                    color={sparkle.color}
                />
            ))}
        </View>
    );
}

export default SparkleFallContainer;
export type {SparkleFallHandle};
