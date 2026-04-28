import { File } from "expo-file-system";
import { Platform } from "react-native";
import { supabase } from "./client";

export const uploadProfileImage = async (
  imageFile: any,
  userId: string
) => {
  try {
    const fileName = `${userId}/profile.jpg`;

    let uploadData;
    let contentType = "image/jpeg";

    if (Platform.OS === "web") {
      // ✅ Web dùng file thật từ browser
      uploadData = imageFile;
      contentType =
        imageFile?.type || "image/jpeg";
    } else {
      // ✅ Mobile dùng uri -> blob
      const response = await fetch(imageFile);
      uploadData = await response.blob();
    }

    const { error } = await supabase.storage
      .from("profiles")
      .upload(fileName, uploadData, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("profiles")
      .getPublicUrl(fileName);

    return `${data.publicUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error(
      "Error uploading profile image:",
      error
    );
    throw error;
  }
};

export const uploadPostImage = async (userId: string, imageUri: string) => {
  try {
    const fileExtension = imageUri.split(".").pop() || "jpg";
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;
    const file = new File(imageUri);
    const bytes = await file.bytes();

    const { error } = await supabase.storage
      .from("posts")
      .upload(fileName, bytes, {
        contentType: `image/${fileExtension}`,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading post image:", error);
    throw error;
  }
};
