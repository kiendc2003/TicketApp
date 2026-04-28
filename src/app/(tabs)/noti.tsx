import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const DATA = [
    { id: "1", message: "Ticket updated", read: false },
    { id: "2", message: "New reply from support", read: false },
    { id: "3", message: "Ticket closed", read: true },
  ];
  
  export default function Noti() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
            Notifications
          </Text>
  
          <FlatList
            data={DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: item.read ? "#f5f5f5" : "#eef2ff",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                {/* Dot */}
                {!item.read && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#4f46e5",
                      marginRight: 10,
                    }}
                  />
                )}
  
                <Text style={{ flex: 1 }}>{item.message}</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }