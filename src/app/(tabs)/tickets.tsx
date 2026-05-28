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
  TextInput,
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
  const [search, setSearch] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

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
    if (status === "Pending") return "#f59e0b";
    return "#9ca3af";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
  
    const hours = date
      .getHours()
      .toString()
      .padStart(2, "0");
  
    const minutes = date
      .getMinutes()
      .toString()
      .padStart(2, "0");
  
    const day = date
      .getDate()
      .toString()
      .padStart(2, "0");
  
    const month = (date.getMonth() + 1)
      .toString()
      .padStart(2, "0");
  
    const year = date.getFullYear();
  
    return `${hours}:${minutes} Ngày ${day} Tháng ${month} Năm ${year}`;
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

    if (item.status === "Closed") {
      if (Platform.OS === "web") {
        showClosedModal();
      } else {
        Alert.alert(
          "Ticket Closed",
          "Closed tickets cannot be updated."
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

  const showClosedModal = () => {
    const modal = document.createElement("div");
  
    modal.innerHTML = `
      <div id="overlay" class="status-overlay">
        <div class="status-modal">
  
          <div class="status-title">
            Ticket Closed
          </div>
  
          <p class="logout-text">
            Closed tickets cannot be updated.
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

  const showStatusModal = (postId: string) => {
    const modal = document.createElement("div");
  
    modal.innerHTML = `
      <div id="overlay" class="status-overlay">
        <div class="status-modal">
  
          <div class="status-title">
            Update Status
          </div>
  
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
  
        {/* FILTER ROW */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 18,
            zIndex: 999,
          }}
        >

          {/* STATUS */}
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              onPress={() => {
                setShowStatusDropdown(
                  !showStatusDropdown
                );

                setShowTimeDropdown(false);
              }}
              style={{
                backgroundColor: "#f3f4f6",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                minWidth: 150,
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Status: {filter} ▼
              </Text>
            </TouchableOpacity>

            {/* DROPDOWN */}
            {showStatusDropdown && (
              <View
                style={{
                  position: "absolute",
                  top: 52,
                  left: 0,
                  width: 180,
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 5,
                  zIndex: 9999,
                }}
              >
                {[
                  "All",
                  "My Ticket",
                  "Pending",
                  "Closed",
                ].map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setFilter(item);
                      setShowStatusDropdown(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          filter === item
                            ? "#4f46e5"
                            : "#111827",

                        fontWeight:
                          filter === item
                            ? "700"
                            : "500",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* TIME */}
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              onPress={() => {
                setShowTimeDropdown(
                  !showTimeDropdown
                );

                setShowStatusDropdown(false);
              }}
              style={{
                backgroundColor: "#f3f4f6",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                minWidth: 170,
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Time: {timeFilter} ▼
              </Text>
            </TouchableOpacity>

            {/* DROPDOWN */}
            {showTimeDropdown && (
              <View
                style={{
                  position: "absolute",
                  top: 52,
                  left: 0,
                  width: 200,
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 5,
                  zIndex: 9999,
                }}
              >
                {[
                  "All Time",
                  "Today",
                  "This Week",
                  "This Month",
                  "This Year",
                ].map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setTimeFilter(item);
                      setShowTimeDropdown(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          timeFilter === item
                            ? "#4f46e5"
                            : "#111827",

                        fontWeight:
                          timeFilter === item
                            ? "700"
                            : "500",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* SEARCH */}
        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="🔍 Search ticket title or user..."
            value={search}
            onChangeText={setSearch}
            style={{
              backgroundColor: "#f9fafb",
              borderWidth: 1,
              borderColor: "#eef0f2",
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>
  
        {/* LIST */}
        {isLoading ? (
          <Text style={{ color: "#666" }}>Loading...</Text>
        ) : (
          <FlatList
          data={posts
            // STATUS FILTER
            .filter((item) => {
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
          
            // TIME FILTER
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
            })
          
            // SEARCH FILTER
            .filter((item) => {
              if (!search.trim()) return true;
            
              const keyword = search.toLowerCase();
            
              const titleMatch = item.title
                ?.toLowerCase()
                .includes(keyword);
            
              const userMatch = item.profiles?.name
                ?.toLowerCase()
                .includes(keyword);
            
              return titleMatch || userMatch;
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
  
                {/* TIME DISPLAY */}
                {item.status === "Pending" ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      marginBottom: 8,
                    }}
                  >
                    📝 Created: {formatTime(item.created_at)}
                  </Text>
                ) : (
                  item.work_time && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      ✅ Completed: {formatTime(item.work_time)}
                    </Text>
                  )
                )}
  
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

            ListEmptyComponent={
              <View
                style={{
                  paddingVertical: 40,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#9ca3af",
                    fontSize: 14,
                  }}
                >
                  No tickets match your current filters.
                </Text>
              </View>
            }

          />
        )}
      </View>


    </SafeAreaView>
  );
}