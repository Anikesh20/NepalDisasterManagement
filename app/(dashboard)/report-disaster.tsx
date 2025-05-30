import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { DisasterType, getDisasterColor, getDisasterIcon, SeverityLevel } from '../services/disasterService';
import reportService, { DisasterReport } from '../services/reportService';
import { colors, shadows } from '../styles/theme';

const NEPAL_DISTRICTS = [
  'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura', 'Banke', 'Bara', 'Bardiya',
  'Bhaktapur', 'Bhojpur', 'Chitwan', 'Dadeldhura', 'Dailekh', 'Dang', 'Darchula', 'Dhading',
  'Dhankuta', 'Dhanusa', 'Dolakha', 'Dolpa', 'Doti', 'Gorkha', 'Gulmi', 'Humla', 'Ilam',
  'Jajarkot', 'Jhapa', 'Jumla', 'Kailali', 'Kalikot', 'Kanchanpur', 'Kapilvastu', 'Kaski',
  'Kathmandu', 'Kavrepalanchok', 'Khotang', 'Lalitpur', 'Lamjung', 'Mahottari', 'Makwanpur',
  'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi', 'Nawalparasi', 'Nuwakot', 'Okhaldhunga',
  'Palpa', 'Panchthar', 'Parbat', 'Parsa', 'Pyuthan', 'Ramechhap', 'Rasuwa', 'Rautahat',
  'Rolpa', 'Rukum', 'Rupandehi', 'Salyan', 'Sankhuwasabha', 'Saptari', 'Sarlahi', 'Sindhuli',
  'Sindhupalchok', 'Siraha', 'Solukhumbu', 'Sunsari', 'Surkhet', 'Syangja', 'Tanahu', 'Taplejung',
  'Terhathum', 'Udayapur',
];

export default function ReportDisasterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [filteredDistricts, setFilteredDistricts] = useState(NEPAL_DISTRICTS);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<DisasterReport>>({
    type: DisasterType.EARTHQUAKE,
    title: '',
    location: '',
    district: '',
    description: '',
    severity: SeverityLevel.MEDIUM,
    reportedBy: 'current-user-id', // This would be the actual user ID in a real app
    contactNumber: '',
    timestamp: new Date().toISOString(),
    status: 'pending',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setFormData(prev => ({
          ...prev,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.district?.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
    }

    if (!formData.contactNumber?.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Upload images if any
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await reportService.uploadReportImages(images, setUploadProgress);
      }

      // Submit the report
      const reportData: DisasterReport = {
        ...formData as DisasterReport,
        images: uploadedImageUrls,
      };

      const response = await reportService.submitDisasterReport(reportData);

      // Success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Report Submitted',
        'Your disaster report has been submitted successfully and is pending verification.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Limit to 5 images
        const newImages = result.assets.slice(0, 5).map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages].slice(0, 5));
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const filterDistricts = (text: string) => {
    const filtered = NEPAL_DISTRICTS.filter(district =>
      district.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDistricts(filtered);
  };

  const handleDistrictChange = (text: string) => {
    setFormData(prev => ({ ...prev, district: text }));
    filterDistricts(text);
  };

  const selectDistrict = (district: string) => {
    setFormData(prev => ({ ...prev, district }));
    setShowDistrictDropdown(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderDisasterTypeSelector = () => {
    const disasterTypes = [
      { type: DisasterType.EARTHQUAKE, label: 'Earthquake' },
      { type: DisasterType.FLOOD, label: 'Flood' },
      { type: DisasterType.FIRE, label: 'Fire' },
      { type: DisasterType.LANDSLIDE, label: 'Landslide' },
      { type: DisasterType.STORM, label: 'Storm' },
    ];

    return (
      <View style={styles.typeSelector}>
        <Text style={styles.label}>Disaster Type</Text>
        <View style={styles.typeButtons}>
          {disasterTypes.map(item => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeButton,
                formData.type === item.type && {
                  backgroundColor: getDisasterColor(item.type) + '30',
                  borderColor: getDisasterColor(item.type),
                }
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, type: item.type }));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name={getDisasterIcon(item.type)}
                size={24}
                color={formData.type === item.type ? getDisasterColor(item.type) : colors.textLight}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === item.type && {
                    color: getDisasterColor(item.type),
                    fontWeight: '600',
                  }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSeveritySelector = () => {
    const severityLevels = [
      { level: SeverityLevel.LOW, label: 'Low' },
      { level: SeverityLevel.MEDIUM, label: 'Medium' },
      { level: SeverityLevel.HIGH, label: 'High' },
      { level: SeverityLevel.CRITICAL, label: 'Critical' },
    ];

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>Severity Level</Text>
        <View style={styles.severityButtons}>
          {severityLevels.map(item => {
            let bgColor = '';
            let textColor = '';

            switch (item.level) {
              case SeverityLevel.LOW:
                bgColor = colors.success + (formData.severity === item.level ? '30' : '10');
                textColor = colors.success;
                break;
              case SeverityLevel.MEDIUM:
                bgColor = colors.warning + (formData.severity === item.level ? '30' : '10');
                textColor = colors.warning;
                break;
              case SeverityLevel.HIGH:
                bgColor = colors.accent + (formData.severity === item.level ? '30' : '10');
                textColor = colors.accent;
                break;
              case SeverityLevel.CRITICAL:
                bgColor = colors.danger + (formData.severity === item.level ? '30' : '10');
                textColor = colors.danger;
                break;
            }

            return (
              <TouchableOpacity
                key={item.level}
                style={[
                  styles.severityButton,
                  { backgroundColor: bgColor },
                  formData.severity === item.level && {
                    borderWidth: 1,
                    borderColor: textColor,
                  }
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, severity: item.level }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[
                    styles.severityButtonText,
                    { color: textColor },
                    formData.severity === item.level && { fontWeight: '600' }
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLocationMap = () => {
    if (!formData.coordinates) {
      return (
        <View style={styles.mapPlaceholder}>
          {locationLoading ? (
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary }} />
          ) : (
            <>
              <Ionicons name="location-outline" size={48} color={colors.textLight} />
              <Text style={styles.mapPlaceholderText}>
                Location permission is required to show your current location
              </Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={requestLocationPermission}
              >
                <Text style={styles.locationButtonText}>Get My Location</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: formData.coordinates.latitude,
            longitude: formData.coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: formData.coordinates.latitude,
              longitude: formData.coordinates.longitude,
            }}
            draggable
            onDragEnd={(e) => {
              setFormData(prev => ({
                ...prev,
                coordinates: {
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                },
              }));
            }}
          />
        </MapView>
        <Text style={styles.mapHint}>Drag the marker to adjust the exact location</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderDisasterTypeSelector()}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Enter a descriptive title"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={[styles.input, errors.location && styles.inputError]}
            placeholder="Enter specific location"
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>District</Text>
          <View style={styles.districtContainer}>
            <TextInput
              style={[styles.input, errors.district && styles.inputError]}
              placeholder="Select district"
              value={formData.district}
              onChangeText={handleDistrictChange}
              onFocus={() => setShowDistrictDropdown(true)}
            />
            <TouchableOpacity
              style={styles.districtDropdownButton}
              onPress={() => setShowDistrictDropdown(!showDistrictDropdown)}
            >
              <Ionicons
                name={showDistrictDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>
          {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}

          {showDistrictDropdown && (
            <View style={styles.districtDropdown}>
              <ScrollView style={styles.districtList} nestedScrollEnabled>
                {filteredDistricts.map(district => (
                  <TouchableOpacity
                    key={district}
                    style={[
                      styles.districtItem,
                      formData.district === district && styles.selectedDistrictItem
                    ]}
                    onPress={() => selectDistrict(district)}
                  >
                    <Text
                      style={[
                        styles.districtItemText,
                        formData.district === district && styles.selectedDistrictItemText
                      ]}
                    >
                      {district}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {renderSeveritySelector()}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe the disaster in detail"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={[styles.input, errors.contactNumber && styles.inputError]}
            placeholder="Enter your contact number"
            value={formData.contactNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, contactNumber: text }))}
            keyboardType="phone-pad"
          />
          {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location on Map</Text>
          {renderLocationMap()}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Images (Optional)</Text>
          <View style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.imageHint}>You can add up to 5 images</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
              <Text style={styles.submitButtonText}>
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Submitting...'}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  typeSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    height: 100,
  },
  districtContainer: {
    position: 'relative',
  },
  districtDropdownButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  districtDropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    ...shadows.medium,
  },
  districtList: {
    padding: 8,
  },
  districtItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedDistrictItem: {
    backgroundColor: colors.primary + '10',
  },
  districtItemText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedDistrictItemText: {
    color: colors.primary,
    fontWeight: '600',
  },
  severityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    ...shadows.small,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: colors.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...shadows.small,
  },
  mapPlaceholderText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 12,
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  mapHint: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  addImageText: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
  imageHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
