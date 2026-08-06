import { usePosts } from "@/hooks/usePosts";
import "@/styles/datepicker.css";

import { supabase } from "@/lib/supabase/client";

import DateTimePicker from "@react-native-community/datetimepicker";

import { useRouter } from "expo-router";

import { useEffect, useState } from "react";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function Create() {
  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [workTime, setWorkTime] =
    useState<Date | null>(null);

  const [showPicker, setShowPicker] =
    useState(false);

  // COMPLETED
  const [isCompleted, setIsCompleted] =
    useState(false);

  // REQUESTER
  const [requester, setRequester] =
    useState("");

  const [requesters, setRequesters] =
    useState<any[]>([]);

  const [showRequesterBox, setShowRequesterBox] =
    useState(false);

  const [newRequester, setNewRequester] =
    useState("");

  const [searchRequester, setSearchRequester] =
    useState("");

  const [ticketType, setTicketType] = useState<
    "Checklist" | "Other"
  >("Other");

  const [otherTasks, setOtherTasks] = useState<string[]>([]);

  const [shift, setShift] = useState("");

  const dailyTasks = [
    "Màn hình LED (up quảng cáo mới)",
    "Màn hình chỉ dẫn",
    "Đếm người",
    "Bãi xe (kiểm tra)",
    "Bãi xe (lấy báo cáo hoá đơn, doanh thu)",
    "Đầu ghi camera",
    "Kiểm tra tình hình server, đường truyền, virus",
  ];

  const [checkedTasks, setCheckedTasks] =
  useState<string[]>([]);

  const { createPost } = usePosts();

  const router = useRouter();

  // LOAD REQUESTERS
  useEffect(() => {
    loadRequesters();
  }, []);

  const addOtherTask = () => {
    setOtherTasks([...otherTasks, ""]);
  };

  const updateOtherTask = (index: number, value: string) => {
    const temp = [...otherTasks];
    temp[index] = value;
    setOtherTasks(temp);
  };

  const removeOtherTask = (index: number) => {
    setOtherTasks(otherTasks.filter((_, i) => i !== index));
  };

  const loadRequesters = async () => {
    try {
      const { data, error } = await supabase
        .from("requesters")
        .select("*")
        .order("total_request", {
          ascending: false,
        });

      if (error) throw error;

      setRequesters(data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // CREATE OR UPDATE REQUESTER
  const handleRequester = async () => {
    if (!requester.trim()) return null;

    try {
      // CHECK EXIST
      const { data: existing } =
        await supabase
          .from("requesters")
          .select("*")
          .eq("name", requester.trim())
          .maybeSingle();

      // EXISTED
      if (existing) {
        return existing.id;
      }
      
      // CREATE NEW
      const { data: created, error } =
        await supabase
          .from("requesters")
          .insert({
            name: requester.trim(),
            total_request: 0,
          })
          .select()
          .single();
      
      if (error) throw error;
      
      return created.id;
      
      } catch (error: any) {
        console.log(
          "Requester Error:",
          JSON.stringify(error, null, 2)
        );
      
        Alert.alert(
          "Requester Error",
          JSON.stringify(error, null, 2)
        );
      
        return null;
      }
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
  
    if (!requester.trim()) {
      Alert.alert("Error", "Requester is required");
      return;
    }
  
    // Checklist phải có ít nhất 1 mục
    if (
      ticketType === "Checklist" &&
      checkedTasks.length === 0 &&
      otherTasks.filter((item) => item.trim() !== "").length === 0
    ) {
      Alert.alert(
        "Error",
        "Please select at least one checklist item or add another task."
      );
      return;
    }
  
    // Other phải nhập Description
    if (
      ticketType === "Other" &&
      !description.trim()
    ) {
      Alert.alert(
        "Error",
        "Description is required."
      );
      return;
    }
  
    if (
      isCompleted &&
      !workTime
    ) {
      Alert.alert(
        "Error",
        "Please select completion time"
      );
      return;
    }
  
    setIsLoading(true);
  
    try {
      const requesterId =
        await handleRequester();
  
      let finalDescription = description;
  
      if (ticketType === "Checklist") {
        finalDescription = [
          ...checkedTasks.map(
            (item) => `• ${item}`
          ),
          ...otherTasks
            .filter(
              (item) => item.trim() !== ""
            )
            .map(
              (item) => `📝 Note: ${item}`
            ),
        ].join("\n");
      }
  
      await createPost(
        title,
        finalDescription,
        isCompleted && workTime
          ? workTime.toISOString()
          : undefined,
        requester,
        requesterId
      );
  
      Alert.alert(
        "Success",
        "Ticket created!"
      );
  
      // Reset form
      setTitle("");
      setDescription("");
      setRequester("");
      setShift("");
      setWorkTime(null);
      setIsCompleted(false);
  
      setTicketType("Other");
      setCheckedTasks([]);
      setOtherTasks([]);
  
      await loadRequesters();
  
      router.replace("/");
    } catch (error: any) {
      console.error(
        "Create Ticket Error:",
        JSON.stringify(
          error,
          null,
          2
        )
      );
  
      Alert.alert(
        "Error",
        JSON.stringify(
          error,
          null,
          2
        )
      );
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

  const toggleTask = (task: string) => {
    setCheckedTasks((prev) =>
      prev.includes(task)
        ? prev.filter((i) => i !== task)
        : [...prev, task]
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
        {/* TITLE */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          Create Ticket
        </Text>

        {/* TITLE INPUT */}
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

        {/* TICKET TYPE */}
        <Text
          style={{
            fontWeight: "600",
            marginBottom: 10,
          }}
        >
          Ticket Type
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              setTicketType("Checklist")
            }
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              backgroundColor:
                ticketType === "Checklist"
                  ? "#4f46e5"
                  : "#f3f4f6",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color:
                  ticketType === "Checklist"
                    ? "#fff"
                    : "#000",
                textAlign: "center",
              }}
            >
              Checklist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setTicketType("Other")
            }
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              backgroundColor:
                ticketType === "Other"
                  ? "#4f46e5"
                  : "#f3f4f6",
            }}
          >
            <Text
              style={{
                color:
                  ticketType === "Other"
                    ? "#fff"
                    : "#000",
                textAlign: "center",
              }}
            >
              Other
            </Text>
          </TouchableOpacity>
        </View>
        {/* new */}
        {ticketType === "Checklist" && (
        <>
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Select Shift
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {["09:30", "14:30", "18:30"].map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => {
                  setShift(time);
                  setTitle(`Daily Checklist - ${time}`);
                }}
                style={{
                  flex: 1,
                  marginHorizontal: 4,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor:
                    shift === time
                      ? "#4f46e5"
                      : "#f3f4f6",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color:
                      shift === time
                        ? "#fff"
                        : "#111827",
                    fontWeight: "600",
                  }}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
        {/* DESCRIPTION */}
        {ticketType === "Checklist" ? (
        <View
          style={{
            marginBottom: 20,
          }}
        >
          {/* Checklist mặc định */}
          {dailyTasks.map((task) => (
            <TouchableOpacity
              key={task}
              onPress={() => toggleTask(task)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  marginRight: 12,
                }}
              >
                {checkedTasks.includes(task) ? "☑" : "☐"}
              </Text>

              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                }}
              >
                {task}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Other Task */}
          {otherTasks.map((task, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <TextInput
                value={task}
                onChangeText={(text) =>
                  updateOtherTask(index, text)
                }
                placeholder={`Other Note ${index + 1}`}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: "#fff",
                }}
              />

              <TouchableOpacity
                onPress={() => removeOtherTask(index)}
                style={{
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    color: "#ef4444",
                    fontSize: 22,
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Other */}
          <TouchableOpacity
            onPress={addOtherTask}
            style={{
              marginTop: 15,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: "#2563eb",
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              ➕ Add Note
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}

        {/* REQUESTER */}
        <TouchableOpacity
          onPress={() =>
            setShowRequesterBox(true)
          }
          style={{
            backgroundColor: "#f5f5f5",
            padding: 14,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: requester
                ? "#111827"
                : "#9ca3af",
            }}
          >
            {requester ||
              "👤 Select requester"}
          </Text>
        </TouchableOpacity>

        {/* COMPLETED TOGGLE */}
        <TouchableOpacity
          onPress={() => {
            setIsCompleted(
              !isCompleted
            );

            if (isCompleted) {
              setWorkTime(null);
            }
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: isCompleted
                ? "#4f46e5"
                : "#cbd5e1",
              backgroundColor:
                isCompleted
                  ? "#4f46e5"
                  : "#fff",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            {isCompleted && (
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                ✓
              </Text>
            )}
          </View>

          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#111827",
            }}
          >
            Mark as completed
          </Text>
        </TouchableOpacity>

        {/* ONLY SHOW WHEN COMPLETED */}
        {isCompleted && (
          <>
            {/* WEB */}
            {Platform.OS === "web" ? (
              <View
                style={{
                  marginBottom: 24,
                  zIndex: 9999,
                  position: "relative",
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      "#f9fafb",
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor:
                      "#eef0f2",
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
                    Completion Time
                  </Text>

                  <DatePicker
                    selected={workTime}
                    onChange={(
                      date: Date | null
                    ) =>
                      setWorkTime(date)
                    }
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    placeholderText="📅 Select completion time"
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
                    Ticket will
                    automatically be
                    closed.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {/* MOBILE BUTTON */}
                <TouchableOpacity
                  onPress={() =>
                    setShowPicker(true)
                  }
                  style={{
                    backgroundColor:
                      "#f5f5f5",
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: workTime
                        ? "#000"
                        : "#9ca3af",
                    }}
                  >
                    {workTime
                      ? formatDate(
                          workTime
                        )
                      : "Select completion time"}
                  </Text>
                </TouchableOpacity>

                {/* MOBILE PICKER */}
                <Modal
                  visible={showPicker}
                  transparent
                  animationType="slide"
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent:
                        "flex-end",
                      backgroundColor:
                        "rgba(0,0,0,0.3)",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          "#fff",
                        padding: 16,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                      }}
                    >
                      <DateTimePicker
                        value={
                          workTime ||
                          new Date()
                        }
                        mode="datetime"
                        display="spinner"
                        style={{
                          height: 200,
                        }}
                        onChange={(
                          event,
                          selectedDate
                        ) => {
                          if (
                            selectedDate
                          ) {
                            setWorkTime(
                              selectedDate
                            );
                          }
                        }}
                      />

                      <TouchableOpacity
                        onPress={() =>
                          setShowPicker(
                            false
                          )
                        }
                        style={{
                          marginTop: 10,
                          backgroundColor:
                            "#4f46e5",
                          padding: 12,
                          borderRadius: 10,
                          alignItems:
                            "center",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              "#fff",
                          }}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </>
            )}
          </>
        )}

        {/* SUBMIT */}
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
            <ActivityIndicator
              color="#fff"
            />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Submit Ticket
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* REQUESTER MODAL */}
      <Modal
        visible={showRequesterBox}
        transparent
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor:
              "rgba(0,0,0,0.2)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 18,
            }}
          >
            {/* TITLE */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 14,
              }}
            >
              Select Requester
            </Text>

            {/* SEARCH */}
            <TextInput
              placeholder="Search requester..."
              value={searchRequester}
              onChangeText={
                setSearchRequester
              }
              style={{
                backgroundColor: "#f5f5f5",
                padding: 12,
                borderRadius: 10,
                marginBottom: 12,
              }}
            />

            {/* LIST */}
            <FlatList
              data={requesters.filter((item) =>
                item.name
                  ?.toLowerCase()
                  .includes(
                    searchRequester.toLowerCase()
                  )
              )}
              keyExtractor={(item) =>
                item.id
              }
              style={{
                maxHeight: 220,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setRequester(
                      item.name
                    );

                    setShowRequesterBox(
                      false
                    );

                    setSearchRequester(
                      ""
                    );
                  }}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor:
                      "#f1f5f9",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    {item.total_request}{" "}
                    requests
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  style={{
                    color: "#9ca3af",
                    textAlign: "center",
                    marginVertical: 20,
                  }}
                >
                  No requester found
                </Text>
              }
            />

            {/* ADD NEW */}
            <View
              style={{
                marginTop: 16,
              }}
            >
              <TextInput
                placeholder="Add new requester..."
                value={newRequester}
                onChangeText={
                  setNewRequester
                }
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  if (
                    !newRequester.trim()
                  )
                    return;

                  setRequester(
                    newRequester.trim()
                  );

                  setNewRequester("");

                  setShowRequesterBox(
                    false
                  );
                }}
                style={{
                  backgroundColor:
                    "#4f46e5",
                  padding: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                  }}
                >
                  + Add New Requester
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setShowRequesterBox(
                    false
                  )
                }
                style={{
                  alignItems: "center",
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}