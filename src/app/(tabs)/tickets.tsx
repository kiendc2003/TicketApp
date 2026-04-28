import { useAuth } from "@/context/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import "@/styles/modal.css";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const btnStyle = (color: string) => `
  width:100%;
  padding:13px;
  margin-bottom:10px;
  border:none;
  border-radius:12px;
  background:${color};
  color:white;
  font-weight:700;
  cursor:pointer;
  font-size:15px;
`;

export default function Tickets() {
  const { posts, isLoading, loadPosts, updatePostStatus } = usePosts();
  const [filter, setFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const {user} = useAuth();

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const filteredData =
    filter === "All"
      ? posts
      : posts.filter((item) => item.status === filter);

  const getStatusColor = (status: string) => {
    if (status === "Open") return "#22c55e";
    if (status === "Pending") return "#f59e0b";
    return "#9ca3af";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔥 handle click ticket

  const handleChangeStatus = (item: any) => {
    // 🔒 Chỉ chủ ticket mới được bấm
    if (item.user_id !== user?.id) {
      if (Platform.OS === "web") {
        showPermissionModal();
        return;
      } else {
        Alert.alert(
          "Permission Denied",
          "You can only update your own ticket."
        );
      }
      return;
    }
  
    const postId = item.id;
  
    if (Platform.OS === "web") {
      showStatusModal(postId);
      return;
  
    } else {
      Alert.alert("Update Status", "Choose new status", [
        {
          text: "Open",
          onPress: () => updatePostStatus(postId, "Open"),
        },
        {
          text: "Pending",
          onPress: () => updatePostStatus(postId, "Pending"),
        },
        {
          text: "Closed",
          onPress: () => updatePostStatus(postId, "Closed"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    }
  };

  const showStatusModal = (postId: string) => {
    const modal = document.createElement("div");
  
    modal.innerHTML = `
      <div id="overlay" class="status-overlay">
        <div class="status-modal">
  
          <div class="status-title">
            Update Status
          </div>
  
          <button id="openBtn" class="status-btn open">
            🟢 Open
          </button>
  
          <button id="pendingBtn" class="status-btn pending">
            🟠 Pending
          </button>
  
          <button id="closedBtn" class="status-btn closed">
            🔴 Closed
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
      .querySelector("#openBtn")
      ?.addEventListener("click", () => {
        updatePostStatus(postId, "Open");
        remove();
      });
  
    modal
      .querySelector("#pendingBtn")
      ?.addEventListener("click", () => {
        updatePostStatus(postId, "Pending");
        remove();
      });
  
    modal
      .querySelector("#closedBtn")
      ?.addEventListener("click", () => {
        updatePostStatus(postId, "Closed");
        remove();
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

  const showPermissionModal = () => {
    const modal = document.createElement("div");
  
    modal.innerHTML = `
      <div id="overlay" class="status-overlay">
        <div class="status-modal">
  
          <div class="status-title">
            Permission Denied
          </div>
  
          <p class="logout-text">
            You can only update your own ticket.
          </p>
  
          <button id="okBtn" class="status-btn closed">
            OK
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
      .querySelector("#okBtn")
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 14,
          }}
        >
          Tickets
        </Text>
  
        {/* STATUS FILTER */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {["All", "My Ticket", "Open", "Pending", "Closed"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                backgroundColor:
                  filter === item ? "#4f46e5" : "#f3f4f6",
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: filter === item ? "#fff" : "#333",
                  fontWeight: "500",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
  
        {/* TIME FILTER */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {["All Time", "Today", "This Week", "This Month", "This Year"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setTimeFilter(item)}
                style={{
                  paddingVertical: 7,
                  paddingHorizontal: 12,
                  backgroundColor:
                    timeFilter === item ? "#111827" : "#f3f4f6",
                  borderRadius: 20,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color:
                      timeFilter === item ? "#fff" : "#333",
                    fontSize: 13,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
  
        {/* LIST */}
        {isLoading ? (
          <Text style={{ color: "#666" }}>Loading...</Text>
        ) : (
          <FlatList
            data={posts
              .filter((item) => {
                // STATUS FILTER
                if (filter === "My Ticket") {
                  return item.user_id === user?.id;
                }
  
                if (
                  filter !== "All" &&
                  filter !== "My Ticket"
                ) {
                  return item.status === filter;
                }
  
                return true;
              })
              .filter((item) => {
                const created = new Date(item.created_at);
                const now = new Date();
  
                if (timeFilter === "Today") {
                  return (
                    created.toDateString() ===
                    now.toDateString()
                  );
                }
  
                if (timeFilter === "This Week") {
                  const start = new Date();
                  start.setDate(now.getDate() - 7);
                  return created >= start;
                }
  
                if (timeFilter === "This Month") {
                  return (
                    created.getMonth() === now.getMonth() &&
                    created.getFullYear() ===
                      now.getFullYear()
                  );
                }
  
                if (timeFilter === "This Year") {
                  return (
                    created.getFullYear() ===
                    now.getFullYear()
                  );
                }
  
                return true;
              })}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleChangeStatus(item)}
                style={{
                  backgroundColor: "#f9fafb",
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#eef0f2",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    fontWeight: "600",
                    marginBottom: 6,
                  }}
                >
                  👤 {item.profiles?.name || "Unknown"}
                </Text>
  
                {item.work_time && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    🕒 Work: {formatTime(item.work_time)}
                  </Text>
                )}
  
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginBottom: 8,
                  }}
                >
                  📝 Created: {formatTime(item.created_at)}
                </Text>
  
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {item.title}
                </Text>
  
                <Text
                  numberOfLines={2}
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: "#6b7280",
                    lineHeight: 20,
                  }}
                >
                  {item.description}
                </Text>
  
                <View
                  style={{
                    marginTop: 12,
                    alignSelf: "flex-start",
                    backgroundColor: getStatusColor(
                      item.status
                    ),
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {item.status || "Open"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}