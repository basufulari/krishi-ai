import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  onPress: () => void;
  color?: string;
};

export function HamburgerButton({ onPress, color = '#fff' }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <TouchableOpacity
      style={styles.touch}
      onPress={handlePress}
      activeOpacity={1}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.line, { backgroundColor: color, width: '100%' }]} />
        <View style={[styles.line, { backgroundColor: color, width: '75%' }]} />
        <View style={[styles.line, { backgroundColor: color, width: '55%' }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  line: {
    height: 2.5,
    borderRadius: 4,
  },
});
