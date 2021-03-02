import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import Slider from '@5stones/react-native-slider';

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Slider />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  container: {
    width: '100%',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
