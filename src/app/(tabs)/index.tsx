import { usePosts } from "@/hooks/usePosts";
import { useRouter } from "expo-router";
import {
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
  const { posts, isLoading, refetch } = usePosts();

  const stats = [
    {
      label: "Open",
      value: posts.filter((p) => p.status === "Open").length,
      color: "#22c55e",
    },
    {
      label: "Pending",
      value: posts.filter((p) => p.status === "Pending").length,
      color: "#f59e0b",
    },
    {
      label: "Closed",
      value: posts.filter((p) => p.status === "Closed").length,
      color: "#9ca3af",
    },
  ];

  const recentTickets = posts.slice(0, 5);

return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <FlatList
      data={recentTickets}
      keyExtractor={(item) => item.id.toString()}

      // Mobile pull to refresh
      refreshing={isLoading}
      onRefresh={refetch}

      ListHeaderComponent={
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 26, fontWeight: "bold" }}>
            Hello 👋
          </Text>

          <Text style={{ color: "#666", marginBottom: 20 }}>
            Here’s your support overview
          </Text>

          {/* 🔥 Web Refresh Button */}
          {Platform.OS === "web" && (
            <TouchableOpacity
              onPress={refetch}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? "#9ca3af" : "#111827",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 14,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                {isLoading ? "⏳ Refreshing..." : "🔄 Refresh Data"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {stats.map((item, index) => (
              <View
                key={item.label}
                style={{
                  flex: 1,
                  backgroundColor: "#f9fafb",
                  padding: 16,
                  borderRadius: 14,
                  marginRight: index !== stats.length - 1 ? 8 : 0,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: item.color,
                  }}
                >
                  {item.value}
                </Text>

                <Text style={{ color: "#666" }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/create")}
            style={{
              backgroundColor: "#4f46e5",
              padding: 16,
              borderRadius: 14,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              + Create New Ticket
            </Text>
          </TouchableOpacity>

          {/* Recent Tickets */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Recent Tickets
          </Text>
        </View>
      }

      renderItem={({ item }) => (
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "#f5f5f5",
            padding: 14,
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            {item.title}
          </Text>

          <Text
            style={{
              color: "#666",
              marginTop: 4,
            }}
          >
            {item.description}
          </Text>
        </View>
      )}

      ListFooterComponent={
        <View style={{ padding: 16 }}>
          <Text
            style={{
              color: "#999",
              textAlign: "center",
            }}
          >
            {isLoading ? "Loading..." : "No more activity"}
          </Text>
        </View>
      }
    />
  </SafeAreaView>
);
}