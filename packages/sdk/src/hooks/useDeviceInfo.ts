import { useCallback } from 'react';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Network from 'expo-network';
import type { DeviceInfo, AppInfo, NetworkInfo } from '../types';

export function useDeviceInfo() {
  const getDeviceInfo = useCallback((): DeviceInfo => {
    try {
      return {
        brand: Device.brand,
        model: Device.modelName,
        os: Device.osName,
        osVersion: Device.osVersion,
      };
    } catch {
      return { brand: null, model: null, os: null, osVersion: null };
    }
  }, []);

  const getAppInfo = useCallback((): AppInfo => {
    try {
      return {
        name: Application.applicationName,
        version: Application.nativeApplicationVersion,
        build: Application.nativeBuildVersion,
      };
    } catch {
      return { name: null, version: null, build: null };
    }
  }, []);

  const getNetworkInfo = useCallback(async (): Promise<NetworkInfo> => {
    try {
      const state = await Network.getNetworkStateAsync();
      return {
        type: state.type ? String(state.type) : null,
        connected: state.isConnected ?? false,
      };
    } catch {
      return { type: null, connected: false };
    }
  }, []);

  return { getDeviceInfo, getAppInfo, getNetworkInfo };
}
