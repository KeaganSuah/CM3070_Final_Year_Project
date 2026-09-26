// Renders the shared Readis logo header used across the main screens.
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Displays the same Readis header size on every screen.
export default function AppHeader() {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../assets/app-header.png')}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel="Readis Community Disaster Reporting"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
    marginTop: 6,
    marginBottom: 16
  },
  image: {
    width: 320,
    height: 58
  }
});
