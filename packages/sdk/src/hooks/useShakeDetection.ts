import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { DEFAULT_SHAKE_THRESHOLD, SHAKE_WINDOW_MS, SHAKE_COUNT, SHAKE_COOLDOWN_MS } from '../constants';

interface UseShakeDetectionOptions {
  enabled: boolean;
  threshold?: number;
  onShake: () => void;
}

export function useShakeDetection({ enabled, threshold, onShake }: UseShakeDetectionOptions) {
  const shakeThreshold = threshold ?? DEFAULT_SHAKE_THRESHOLD;
  const timestamps = useRef<number[]>([]);
  const lastShake = useRef(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude < shakeThreshold) return;

      const now = Date.now();

      // Cooldown check
      if (now - lastShake.current < SHAKE_COOLDOWN_MS) return;

      // Add timestamp and clean old ones
      timestamps.current.push(now);
      timestamps.current = timestamps.current.filter((t) => now - t < SHAKE_WINDOW_MS);

      if (timestamps.current.length >= SHAKE_COUNT) {
        lastShake.current = now;
        timestamps.current = [];
        onShakeRef.current();
      }
    });

    return () => subscription.remove();
  }, [enabled, shakeThreshold]);
}
