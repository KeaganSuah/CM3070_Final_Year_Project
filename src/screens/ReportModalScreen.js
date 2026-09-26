// Collects structured incident details, map location and optional photo evidence.
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import FilterChip from '../components/FilterChip';
import LocationPicker from '../components/LocationPicker';
import { AREAS, DISASTER_TYPES, SEVERITIES } from '../constants/options';
import { AREA_CENTERS } from '../constants/map';
import { COLORS } from '../constants/theme';
import AppHeader from '../components/AppHeader';
import { getClosestArea } from '../utils/locationUtils';
import { persistIncidentPhoto } from '../utils/mediaUtils';
import { selectionFeedback, successFeedback } from '../utils/deviceFeedback';

// Builds a readable address and postal code from reverse-geocoding results.
function formatReverseGeocode(place = {}) {
  const street = [place.streetNumber, place.street].filter(Boolean).join(' ');
  return [street, place.district || place.subregion || place.city].filter(Boolean).join(', ');
}

// Collects the information needed to create and locate an incident report.
export default function ReportModalScreen({ navigation, onSubmit, isTabScreen = false }) {
  const [type, setType] = useState('Flood');
  const [area, setArea] = useState(AREAS[0]);
  const [location, setLocation] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState(AREA_CENTERS[AREAS[0]]);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const isValid = useMemo(
    () => location.trim().length > 5 && description.trim().length > 8 && Number.isFinite(pin.latitude) && Number.isFinite(pin.longitude),
    [location, description, pin]
  );

  // Updates the compass area and moves the pin to that region’s default centre.
  const selectArea = (nextArea) => {
    setArea(nextArea);
    setPin(AREA_CENTERS[nextArea]);
    selectionFeedback();
  };

  // Updates the map pin and derives the closest compass region from its coordinates.
  const movePin = (nextCoordinate) => {
    setPin(nextCoordinate);
    setArea(getClosestArea(nextCoordinate.latitude, nextCoordinate.longitude));
  };

  // Requests foreground GPS access and uses the device position for the report.
  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Location permission needed', 'Allow location access to place the report at your current position. You can still set the pin manually.');
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 60_000, requiredAccuracy: 200 });
      const position = lastKnown || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const current = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setUserLocation(current);
      movePin(current);

      try {
        const places = await Location.reverseGeocodeAsync(current);
        const place = places?.[0];
        if (place) {
          if (!location.trim()) setLocation(formatReverseGeocode(place));
          if (!postalCode.trim() && place.postalCode) setPostalCode(place.postalCode);
        }
      } catch {
        // Pin placement remains valid even if reverse geocoding is unavailable.
      }
      await successFeedback();
    } catch {
      Alert.alert('Unable to find location', 'Check that location services are enabled and try again, or place the pin manually.');
    } finally {
      setLocating(false);
    }
  };

  // Processes and stores a selected incident image before attaching it to the report.
  const saveSelectedPhoto = async (asset) => {
    if (!asset?.uri) return;
    setPhotoBusy(true);
    try {
      const persisted = await persistIncidentPhoto(asset);
      setPhotoUri(persisted);
      await successFeedback();
    } finally {
      setPhotoBusy(false);
    }
  };

  // Requests camera permission and captures optional incident evidence.
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access to attach a photo, or submit the report without one.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) await saveSelectedPhoto(result.assets?.[0]);
  };

  // Requests photo-library permission and selects optional incident evidence.
  const choosePhoto = async () => {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo permission needed', 'Allow photo access only if you want to attach evidence. You can still submit the report without an image.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, selectionLimit: 1 });
    if (!result.canceled) await saveSelectedPhoto(result.assets?.[0]);
  };

  // Restores the report form to its default values after a successful submission.
  const resetForm = () => {
    setLocation('');
    setPostalCode('');
    setDescription('');
    setSeverity('Moderate');
    setType('Flood');
    setArea(AREAS[0]);
    setPin(AREA_CENTERS[AREAS[0]]);
    setUserLocation(null);
    setPhotoUri(null);
  };

  // Validates the report, saves it and returns the user to the appropriate screen.
  const submit = async () => {
    if (!isValid) {
      Alert.alert('Incomplete report', 'Please add an address, a short description, and confirm the map pin.');
      return;
    }

    await onSubmit({
      type,
      area,
      location: location.trim(),
      postalCode: postalCode.trim(),
      severity,
      description: description.trim(),
      latitude: pin.latitude,
      longitude: pin.longitude,
      photoUri: photoUri || null
    });
    await successFeedback();
    resetForm();

    if (isTabScreen) navigation.navigate('Feed');
    else navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppHeader />
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>Report incident</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionLabel}>Disaster type</Text>
        <View style={styles.wrapRow}>
          {DISASTER_TYPES.slice(1).map((item) => (
            <FilterChip key={item} label={item} active={type === item} onPress={() => { setType(item); selectionFeedback(); }} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Area</Text>
        <View style={styles.wrapRow}>
          {AREAS.map((item) => (
            <FilterChip key={item} label={item} active={area === item} onPress={() => selectArea(item)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Address</Text>
        <TextInput style={styles.input} placeholder="Example: 21 Eastview Avenue" placeholderTextColor={COLORS.textMuted} value={location} onChangeText={setLocation} />

        <Text style={styles.sectionLabel}>Postal code (optional)</Text>
        <TextInput style={styles.input} placeholder="Example: 460215" placeholderTextColor={COLORS.textMuted} value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" />

        <View style={styles.mapTitleRow}>
          <View style={styles.mapTitleText}>
            <Text style={styles.sectionLabelNoMargin}>Pin incident location</Text>
            <Text style={styles.mapHelp}>Tap the map or drag the pin. Current location can also fill the address when available.</Text>
          </View>
          <Pressable style={styles.locationButton} onPress={useCurrentLocation} disabled={locating} accessibilityRole="button" accessibilityLabel="Use my current location for this incident">
            <Ionicons name="locate" size={18} color="#FFF" />
            <Text style={styles.locationButtonText}>{locating ? 'Finding…' : 'Use my location'}</Text>
          </Pressable>
        </View>

        <LocationPicker coordinate={pin} onChange={movePin} userLocation={userLocation} />
        <View style={styles.coordinateCard}>
          <Ionicons name="pin-outline" size={18} color={COLORS.primary} />
          <Text style={styles.coordinateText}>{area} · {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}</Text>
        </View>

        <Text style={styles.sectionLabel}>Photo evidence (optional)</Text>
        <Text style={styles.helperText}>Attach a photo only when it is safe and appropriate to do so.</Text>
        <View style={styles.photoActions}>
          <Pressable style={styles.secondaryAction} onPress={takePhoto} disabled={photoBusy} accessibilityRole="button" accessibilityLabel="Take incident photo">
            <Ionicons name="camera-outline" size={19} color={COLORS.primary} />
            <Text style={styles.secondaryActionText}>Take photo</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={choosePhoto} disabled={photoBusy} accessibilityRole="button" accessibilityLabel="Choose incident photo from library">
            <Ionicons name="images-outline" size={19} color={COLORS.primary} />
            <Text style={styles.secondaryActionText}>Choose photo</Text>
          </Pressable>
        </View>
        {photoUri ? (
          <View style={styles.photoPreviewWrap}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" accessibilityLabel="Selected incident evidence" />
            <Pressable style={styles.removePhoto} onPress={() => setPhotoUri(null)} accessibilityRole="button" accessibilityLabel="Remove incident photo">
              <Ionicons name="close" size={18} color="#FFF" />
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Severity</Text>
        <View style={styles.wrapRow}>
          {SEVERITIES.map((item) => (
            <FilterChip key={item} label={item} active={severity === item} onPress={() => { setSeverity(item); selectionFeedback(); }} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe what is happening and why others should be careful." placeholderTextColor={COLORS.textMuted} value={description} onChangeText={setDescription} multiline textAlignVertical="top" />

        <Pressable style={[styles.submitButton, !isValid && styles.submitDisabled]} onPress={submit} accessibilityRole="button" accessibilityLabel="Post incident report">
          <Text style={styles.submitText}>Post report</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  headerSpacer: { width: 40, height: 40 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  sectionLabel: { marginTop: 18, marginBottom: 10, color: COLORS.text, fontWeight: '700', fontSize: 16 },
  sectionLabelNoMargin: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  helperText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, marginTop: -4, marginBottom: 10 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.text, fontSize: 16 },
  mapTitleRow: { marginTop: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  mapTitleText: { flex: 1 },
  mapHelp: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10 },
  locationButtonText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  coordinateCard: { marginTop: 10, backgroundColor: COLORS.primarySoft, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  coordinateText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 13 },
  photoActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  secondaryAction: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11 },
  secondaryActionText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  photoPreviewWrap: { marginTop: 12, position: 'relative' },
  photoPreview: { width: '100%', height: 180, borderRadius: 16, backgroundColor: COLORS.border },
  removePhoto: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(29,43,79,0.86)', alignItems: 'center', justifyContent: 'center' },
  textArea: { minHeight: 130 },
  submitButton: { marginTop: 26, backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});
