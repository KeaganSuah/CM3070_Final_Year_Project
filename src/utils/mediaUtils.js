// Processes, stores and prepares selected images for local use and synchronisation.
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

// Limits prototype media payload size before sending it through the JSON API.
const MAX_SYNC_CHARS = 2_800_000;

// Resizes, compresses and stores a selected image in the app document folder.
export async function persistPickedImage(asset, prefix = "readis-media") {
  if (!asset?.uri) return null;
  if (Platform.OS === "web") return asset.uri;

  let source = asset.uri;
  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      source,
      [{ resize: { width: 1280 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    source = manipulated.uri;
  } catch {
    // Keep original if image manipulation is unavailable.
  }

  if (!FileSystem.documentDirectory) return source;
  const destination = `${FileSystem.documentDirectory}${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
  try {
    await FileSystem.copyAsync({ from: source, to: destination });
    return destination;
  } catch {
    return source;
  }
}

// Stores an incident photo using the shared media-processing pipeline.
export async function persistIncidentPhoto(assetOrUri) {
  const asset =
    typeof assetOrUri === "string" ? { uri: assetOrUri } : assetOrUri;
  return persistPickedImage(asset, "readis-incident");
}

// Stores a guide image using the shared media-processing pipeline.
export async function persistGuideImage(asset) {
  return persistPickedImage(asset, "readis-guide");
}

// Converts local media into a bounded data value that the prototype API can send.
export async function mediaUriToSyncValue(uri) {
  if (!uri) return null;
  if (
    uri.startsWith("data:") ||
    uri.startsWith("http://") ||
    uri.startsWith("https://")
  )
    return uri;

  try {
    if (Platform.OS === "web") return uri;
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const value = `data:image/jpeg;base64,${base64}`;
    return value.length <= MAX_SYNC_CHARS ? value : null;
  } catch {
    return null;
  }
}
