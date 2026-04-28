import { usePosts } from "@/hooks/usePosts";
import "@/styles/datepicker.css";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ActivityIndicator,
  Alert, Modal, Platform, Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workTime, setWorkTime] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const { createPost } = usePosts();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
  
    setIsLoading(true);
    try {
      await createPost(title, description, workTime ? workTime.toISOString() : undefined); // ✅ tách riêng
  
      Alert.alert("Success", "Ticket created!");
  
      setTitle("");
      setDescription("");
  
      router.replace("/");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Create Ticket
        </Text>

        {/* Title */}
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={{
            backgroundColor: "#f5f5f5",
            padding: 14,
            borderRadius: 10,
            marginBottom: 12,
          }}
        />

        {/* Description */}
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{
            backgroundColor: "#f5f5f5",
            padding: 14,
            borderRadius: 10,
            height: 120,
            textAlignVertical: "top",
            marginBottom: 16,
          }}
        />


        {Platform.OS === "web" ? (
        // ✅ Web
        <View
  style={{
    marginBottom: 24,
    zIndex: 9999,
    position: "relative",
  }}
>
  {/* Card style picker */}
  <View
    style={{
      backgroundColor: "#f9fafb",
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: "#eef0f2",
    }}
  >
    <Text
      style={{
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 8,
        fontWeight: "500",
      }}
    >
      Support Completion Time
    </Text>

    
      <DatePicker
        selected={workTime}
        onChange={(date: Date | null) =>
          setWorkTime(date)
        }
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="dd/MM/yyyy HH:mm"
        placeholderText="📅 Select date & time"
        className="custom-datepicker"
        withPortal
      />

    <Text
      style={{
        marginTop: 10,
        fontSize: 12,
        color: "#9ca3af",
      }}
    >
      Choose the time you finished support.
    </Text>
  </View>
</View>
        ) : (
        // ✅ Mobile
        <>
            {/* Button mở picker */}
            <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={{
                backgroundColor: "#f5f5f5",
                padding: 14,
                borderRadius: 10,
                marginBottom: 12,
            }}
            >
            <Text style={{ color: workTime ? "#000" : "#9ca3af" }}>
                {workTime ? formatDate(workTime) : "Chọn thời gian làm việc"}
            </Text>
            </TouchableOpacity>

            {/* Modal Picker */}
            <Modal visible={showPicker} transparent animationType="slide">
            <View
                style={{
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "rgba(0,0,0,0.3)",
                }}
            >
                <View
                style={{
                    backgroundColor: "#fff",
                    padding: 16,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                }}
                >
                {/* Picker */}
                <DateTimePicker
                    value={workTime || new Date()}
                    mode="datetime"
                    display="spinner"
                    style={{ height: 200 }}
                    onChange={(event, selectedDate) => {
                    if (selectedDate) {
                        setWorkTime(selectedDate);
                    }
                    }}
                />

                {/* Done */}
                <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={{
                    marginTop: 10,
                    backgroundColor: "#4f46e5",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    }}
                >
                    <Text style={{ color: "#fff" }}>Done</Text>
                </TouchableOpacity>
                </View>
            </View>
            </Modal>
        </>
        )}

        
        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          style={{
            backgroundColor: "#4f46e5",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Submit Ticket
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}