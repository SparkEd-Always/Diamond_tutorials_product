import React from 'react';
import { StatusBar } from 'expo-status-bar';

import UnifiedAppNavigator from './src/navigation/UnifiedAppNavigator';

export default function App() {
  return (
    <>
      <UnifiedAppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
