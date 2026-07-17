import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import type { DatePhoto } from '../types';

interface PhotoViewerModalProps {
  photo: DatePhoto | null;
  onClose: () => void;
}

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

export default function PhotoViewerModal({ photo, onClose }: PhotoViewerModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { width, height } = useWindowDimensions();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    'worklet';
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(savedScale.value * event.scale, MAX_SCALE));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) resetZoom();
    });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (savedScale.value <= 1) return;
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > 1) {
        resetZoom();
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE);
        savedScale.value = DOUBLE_TAP_SCALE;
      }
    });

  const composedGesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleClose = () => {
    resetZoom();
    onClose();
  };

  return (
    <Modal visible={!!photo} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Pressable hitSlop={10} onPress={handleClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={22} color={theme.colors.onPrimary} />
        </Pressable>

        {photo && (
          <View style={[styles.imageWrap, { width, height }]} pointerEvents="box-none">
            <GestureDetector gesture={composedGesture}>
              <View style={styles.imageBox}>
                <Animated.Image
                  source={{ uri: photo.url }}
                  style={[styles.image, imageStyle]}
                  resizeMode="contain"
                />
              </View>
            </GestureDetector>
          </View>
        )}

        {photo?.caption ? (
          <View style={styles.captionWrap} pointerEvents="none">
            <Text style={styles.caption}>{photo.caption}</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(12,10,9,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 56,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    imageWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageBox: {
      width: '100%',
      height: '80%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    captionWrap: {
      position: 'absolute',
      bottom: 48,
      left: 32,
      right: 32,
      alignItems: 'center',
    },
    caption: {
      fontFamily: theme.fonts.displayItalic,
      fontSize: 16,
      color: theme.colors.onPrimary,
      textAlign: 'center',
    },
  });
