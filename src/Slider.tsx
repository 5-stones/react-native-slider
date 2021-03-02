import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

export interface SliderProps {
  value?: number;
  onValueChange?: (value: number) => void;
  thumbSize?: number;
  minimumValue?: number;
  maximumValue?: number;
  defaultContainerWidth?: number;
  containerStyle?: ViewStyle;
  thumbStyle?: ViewStyle;
  minimumTrackStyle?: ViewStyle;
  maximumTrackStyle?: ViewStyle;
}

export const Slider: React.FC<SliderProps> = ({
  value = 0,
  onValueChange = () => {},
  thumbSize = 12,
  minimumValue = 0,
  maximumValue = 1,
  defaultContainerWidth = 200,
  containerStyle = {},
  thumbStyle = {},
  minimumTrackStyle = {},
  maximumTrackStyle = {},
}) => {
  const touchX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState<number>(
    defaultContainerWidth
  );
  const [trackSize, setTrackSize] = useState<{
    width?: number;
    height?: number;
  }>({});
  const onLayoutContainer = (event: LayoutChangeEvent) => {
    const {
      nativeEvent: {
        layout: { width },
      },
    } = event;
    setContainerWidth(width as number);
  };
  const onLayoutTrack = (event: LayoutChangeEvent) => {
    const {
      nativeEvent: {
        layout: { width, height },
      },
    } = event;
    setTrackSize({ width, height });
  };
  const thumbRadius = thumbSize / 2;

  /*-----  Slide Event Handlers  -----*/
  const getBoundedValue = useCallback(
    (val: number, maxVal: number, minVal: number): number => {
      return Math.max(Math.min(val, maxVal), minVal);
    },
    []
  );

  const getRelativePosition = useCallback(
    (val: number, maxVal: number, minVal: number): number => {
      const bounded = getBoundedValue(val, maxVal, minVal);
      const ratio = bounded / (maxVal - minVal);
      return ratio * containerWidth;
    },
    [getBoundedValue, containerWidth]
  );

  const getRelativeValue = (
    position: number,
    maxVal: number,
    minVal: number
  ): number => {
    const ratio = position / containerWidth;
    const val = ratio * (maxVal - minVal);
    return getBoundedValue(val, maxVal, minVal);
  };

  // compute the initial position of the slider
  useEffect(() => {
    const position = getRelativePosition(value, maximumValue, minimumValue);
    touchX.setValue(position);
  }, [
    value,
    minimumValue,
    maximumValue,
    containerWidth,
    getRelativePosition,
    touchX,
  ]);

  const onPanResponderMove = (event: PanGestureHandlerGestureEvent) => {
    const {
      nativeEvent: { x },
    } = event;
    const val = getRelativeValue(x, maximumValue, minimumValue);
    onValueChange(val);
  };

  return (
    <PanGestureHandler
      onGestureEvent={Animated.event([{ nativeEvent: { x: touchX } }], {
        useNativeDriver: false,
        listener: onPanResponderMove,
      })}
    >
      <Animated.View
        style={[dynamicStyles.container(thumbRadius), containerStyle]}
        onLayout={onLayoutContainer}
      >
        <Animated.View
          style={[styles.maximumTrack, maximumTrackStyle]}
          onLayout={onLayoutTrack}
        >
          <Animated.View
            style={[
              dynamicStyles.minimumTrack(thumbRadius, trackSize.width),
              minimumTrackStyle,
              {
                transform: [
                  {
                    translateX: touchX.interpolate({
                      inputRange: [0, containerWidth],
                      outputRange: [0, containerWidth],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={[
            dynamicStyles.thumb(thumbRadius, trackSize.height),
            thumbStyle,
            {
              transform: [
                {
                  translateX: Animated.add(
                    touchX,
                    new Animated.Value(-thumbRadius)
                  ).interpolate({
                    inputRange: [-thumbRadius, containerWidth - thumbRadius],
                    outputRange: [0, containerWidth],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </PanGestureHandler>
  );
};

const dynamicStyles = {
  container: (thumbRadius: number): ViewStyle => ({
    marginLeft: thumbRadius,
    marginRight: thumbRadius,
  }),
  thumb: (thumbRadius: number, trackHeight: number = 0): ViewStyle => ({
    position: 'absolute',
    top: -thumbRadius + trackHeight / 2,
    borderRadius: thumbRadius,
    left: -thumbRadius,
    height: thumbRadius * 2,
    width: thumbRadius * 2,

    // general styles
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: 'black',
  }),
  minimumTrack: (thumbRadius: number, trackWidth?: number): ViewStyle => ({
    height: '100%',
    position: 'absolute',
    top: 0,
    left: trackWidth ? -(trackWidth + thumbRadius) : '-100%',
    width: trackWidth ? trackWidth + thumbRadius : '100%',

    // general styles
    backgroundColor: 'black',
  }),
};

const styles = StyleSheet.create({
  maximumTrack: {
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',

    // general styles
    height: 5,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 20,
  },
});
