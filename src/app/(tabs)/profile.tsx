import { useAuth } from "@/context/AuthContext";
import { uploadProfileImage } from "@/lib/supabase/storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { user, updateUser, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdateProfileImage = async () => {
    if (!user) return;
  
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need permission to select image."
      );
      return;
    }
  
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
  
    if (!result.canceled && result.assets[0]) {
      setIsUpdating(true);
  
      try {
        const asset = result.assets[0];
  
        const imageUrl =
          await uploadProfileImage(
            Platform.OS === "web"
              ? asset.file
              : asset.uri,
            user.id
          );
  
        await updateUser({
          profileImage: imageUrl,
        });
  
        Alert.alert(
          "Success",
          "Profile image updated."
        );
      } catch (error) {
        console.error(error);
  
        Alert.alert(
          "Error",
          "Failed to update image."
        );
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      showLogoutModal();
      return;
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ]);
    }
  };

  const showLogoutModal = () => {
    const modal = document.createElement("div");
  
    modal.innerHTML = `
      <div id="overlay" class="status-overlay">
        <div class="status-modal">
  
          <div class="status-title">
            Sign Out
          </div>
  
          <p class="logout-text">
            Are you sure you want to sign out?
          </p>
  
          <button id="logoutBtn" class="status-btn closed">
            🚪 Sign Out
          </button>
  
          <button id="cancelBtn" class="status-btn cancel">
            Cancel
          </button>
  
        </div>
      </div>
    `;
  
    document.body.appendChild(modal);
  
    const remove = () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };
  
    modal
      .querySelector("#logoutBtn")
      ?.addEventListener("click", async () => {
        remove();
        await signOut();
        router.replace("/(auth)/login");
      });
  
    modal
      .querySelector("#cancelBtn")
      ?.addEventListener("click", remove);
  
    modal
      .querySelector("#overlay")
      ?.addEventListener("click", (e: any) => {
        if (e.target.id === "overlay") {
          remove();
        }
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            disabled={isUpdating}
          >
            <View>
              {user?.profileImage ? (
                <Image
                  source={{
                    uri:
                      Platform.OS === "web"
                        ? `${user.profileImage}&t=${Date.now()}`
                        : user.profileImage,
                  }}
                  style={styles.profileImage}
                  cachePolicy="none"
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[styles.profileImage, styles.profileImagePlaceholder]}
                >
                  <Text style={styles.profileImageText}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}

              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>Edit</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || "No Name"}</Text>
          <Text style={styles.username}>@{user?.username || "user"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Help & Support</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.settingItem, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 32,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: "600",
    color: "#666",
  },
  editBadge: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -22 }],
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 18,
    color: "#999",
  },
  settingValue: {
    fontSize: 18,
    color: "#999",
  },
  signOutButton: {
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  signOutText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
});
