import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import StopDetailCard from './StopDetailCard';
import type { Stop } from '../types';

interface StopDetailCardSwiperProps {
  stop: Stop;
  index: number;
  total: number;
  isCurrent: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
  onPress: () => void;
}

const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 800;

export default function StopDetailCardSwiper({
  stop,
  index,
  total,
  isCurrent,
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft,
  canSwipeRight,
  onPress,
}: StopDetailCardSwiperProps) {
  const translateX = useSharedValue(0);
  // Direction of the most recently committed swipe, read synchronously by the
  // very next render (before the entering/exiting animation picks a variant),
  // so a ref is used instead of state to avoid a redundant extra render.
  const lastDirection = useRef<'left' | 'right'>('left');

  const commitSwipeLeft = () => {
    lastDirection.current = 'left';
    onSwipeLeft();
  };

  const commitSwipeRight = () => {
    lastDirection.current = 'right';
    onSwipeRight();
  };

  const pan = Gesture.Pan()
    // Requires a real, deliberate drag before the pan activates at all — a
    // stationary or near-stationary touch never enters this gesture, so it
    // can't "win" against the sibling tap gesture below and suppress it.
    .minDistance(10)
    .onChange((event) => {
      const resist = (event.translationX > 0 && !canSwipeRight) || (event.translationX < 0 && !canSwipeLeft);
      translateX.value = resist ? event.translationX / 4 : event.translationX;
    })
    .onEnd((event) => {
      const committedLeft =
        canSwipeLeft && (event.translationX < -SWIPE_DISTANCE_THRESHOLD || event.velocityX < -SWIPE_VELOCITY_THRESHOLD);
      const committedRight =
        canSwipeRight && (event.translationX > SWIPE_DISTANCE_THRESHOLD || event.velocityX > SWIPE_VELOCITY_THRESHOLD);

      if (committedLeft) {
        // The card is about to unmount and hand off to the `exiting` slide
        // animation, which owns the transform from here — reset instantly
        // rather than spring back, or the two animations fight each other.
        translateX.value = 0;
        runOnJS(commitSwipeLeft)();
      } else if (committedRight) {
        translateX.value = 0;
        runOnJS(commitSwipeRight)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  // A dedicated tap gesture, raced against the pan above: whichever actually
  // activates first wins. Since pan requires 10px of movement to activate at
  // all, a real tap is unambiguous — this one fires and pan never does.
  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onPress)();
  });

  const gesture = Gesture.Race(pan, tap);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        key={stop.id}
        entering={(lastDirection.current === 'left' ? SlideInRight : SlideInLeft).duration(280)}
        exiting={(lastDirection.current === 'left' ? SlideOutLeft : SlideOutRight).duration(280)}
        style={[styles.wrap, dragStyle]}
      >
        <StopDetailCard stop={stop} index={index} total={total} isCurrent={isCurrent} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
});
