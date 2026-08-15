import { useAuth } from "@/context/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import "@/styles/modal.css";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
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
  const { posts, isLoading, loadPosts } = usePosts();
  const [filter, setFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const {user} = useAuth();
  const [search, setSearch] = useState("");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const ITEMS_PER_PAGE = 50;
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "checklist" | "other"
  >("checklist");

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  useEffect(() => {
    setPage(1);
}, [filter, timeFilter, search]);

const checklistTickets = posts.filter(
  (item: any) =>
    Array.isArray(item.checklist) &&
    item.checklist.length > 0
);

const otherTickets = posts.filter(
  (item: any) =>
    !Array.isArray(item.checklist) ||
    item.checklist.length === 0
);

const exportChecklistPDF = async (item: any) => {

  console.log("========== EXPORT PDF START ==========");
  console.log("PDF ITEM:", item);

  try {
    // ==========================================
    // 1. CHECK CHECKLIST
    // ==========================================

    if (
      !item.checklist ||
      !Array.isArray(item.checklist) ||
      item.checklist.length === 0
    ) {
      Alert.alert(
        "No Checklist",
        "This ticket does not have any checklist."
      );
      return;
    }

    const checklist = item.checklist;

    // ==========================================
    // 2. GROUP BY CATALOG
    // ==========================================

    const grouped = checklist.reduce(
      (
        groups: Record<string, any[]>,
        checklistItem: any
      ) => {
        const catalog =
          checklistItem.catalog_name ||
          "Other";

        if (!groups[catalog]) {
          groups[catalog] = [];
        }

        groups[catalog].push(checklistItem);

        return groups;
      },
      {}
    );

    // ==========================================
    // 3. CREATE CHECKLIST HTML
    // ==========================================

    const catalogHTML = Object.entries(
      grouped
    )
      .map(
        (
          [catalogName, items],
          catalogIndex
        ) => {
          const catalogNumber =
            catalogIndex + 1;

          // --------------------------
          // CATALOG ROW
          // --------------------------

          const catalogRow = `
            <tr class="catalog-row">

              <td class="stt catalog-stt">
                ${catalogNumber}.
              </td>

              <td class="catalog-name">
                ${catalogName}
              </td>

              <td class="status">
              </td>

              <td class="note">
              </td>

            </tr>
          `;

          // --------------------------
          // CHECKLIST ITEMS
          // --------------------------

          const rows = (items as any[])
            .map(
              (
                checkItem: any,
                itemIndex: number
              ) => {
                const status =
                  checkItem.status || "-";

                let statusClass =
                  "status-empty";

                if (status === "OK") {
                  statusClass =
                    "status-ok";
                } else if (
                  status === "NOT OK"
                ) {
                  statusClass =
                    "status-not-ok";
                }

                const stt =
                  `${catalogNumber}.${itemIndex + 1}`;

                return `
                  <tr>

                    <!-- STT -->
                    <td class="stt">
                      ${stt}
                    </td>

                    <!-- NAME -->
                    <td class="name">
                      ${checkItem.name || "-"}
                    </td>

                    <!-- STATUS -->
                    <td class="status">
                      <span class="${statusClass}">
                        ${status}
                      </span>
                    </td>

                    <!-- NOTE -->
                    <td class="note">
                      ${checkItem.note || "-"}
                    </td>

                  </tr>
                `;
              }
            )
            .join("");

          return (
            catalogRow +
            rows
          );
        }
      )
      .join("");

    // ==========================================
    // 4. TICKET INFORMATION
    // ==========================================

    const requester =
      item.profiles?.name ||
      item.requester ||
      "-";

    const createdAt = item.created_at
      ? new Date(
          item.created_at
        ).toLocaleString("vi-VN")
      : "-";

    const completedAt = item.work_time
      ? new Date(
          item.work_time
        ).toLocaleString("vi-VN")
      : "-";

    // ==========================================
    // 5. HTML
    // ==========================================

    const html = `
      <!DOCTYPE html>

      <html lang="vi">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            margin: 0;
            padding: 30px;

            color: #111827;

            background: #ffffff;
          }

          .report {
            width: 100%;
            max-width: 1000px;

            margin: 0 auto;
          }

          /* =========================
             TITLE
          ========================= */

          .title {
            text-align: center;

            margin-bottom: 25px;
          }

          .title h1 {
            margin: 0;

            font-size: 24px;

            font-weight: 700;

            letter-spacing: 0.5px;
          }

          .title p {
            margin-top: 6px;

            font-size: 12px;

            color: #6b7280;
          }

          /* =========================
             TICKET INFO
          ========================= */

          .info {
            border: 1px solid #d1d5db;

            border-radius: 6px;

            padding: 12px 15px;

            margin-bottom: 20px;
          }

          .info-row {
            display: flex;

            margin-bottom: 6px;

            font-size: 12px;
          }

          .info-row:last-child {
            margin-bottom: 0;
          }

          .info-label {
            width: 110px;

            font-weight: 700;

            color: #374151;
          }

          .info-value {
            flex: 1;

            color: #111827;
          }

          /* =========================
             TABLE
          ========================= */

          table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;

            font-size: 11px;
          }

          th {
            background: #f3f4f6;

            border: 1px solid #9ca3af;

            padding: 7px 6px;

            text-align: left;

            font-size: 11px;

            font-weight: 700;

            color: #374151;
          }

          td {
            border: 1px solid #d1d5db;

            padding: 7px 6px;

            vertical-align: middle;

            word-wrap: break-word;
          }

          /* =========================
             COLUMN WIDTH
          ========================= */

          .stt {
            width: 7%;

            text-align: center;

            white-space: nowrap;
          }

          .name {
            width: 48%;
          }

          .status {
            width: 12%;

            text-align: center;
          }

          .note {
            width: 33%;
          }

          /* =========================
             CATALOG
          ========================= */

          .catalog-row td {
            background: #f3f4f6;

            font-weight: 700;

            color: #111827;
          }

          .catalog-stt {
            font-weight: 700;

            text-align: center;
          }

          .catalog-name {
            font-weight: 700;

            font-size: 12px;
          }

          /* =========================
             STATUS
          ========================= */

          .status-ok {
            color: #15803d;

            font-weight: 700;
          }

          .status-not-ok {
            color: #dc2626;

            font-weight: 700;
          }

          .status-empty {
            color: #6b7280;
          }

          /* =========================
             FOOTER
          ========================= */

          .footer {
            margin-top: 25px;

            padding-top: 10px;

            border-top: 1px solid #d1d5db;

            display: flex;

            justify-content: space-between;

            font-size: 10px;

            color: #6b7280;
          }

          /* =========================
             PRINT
          ========================= */

          @media print {

            body {
              padding: 0;
            }

            .report {
              max-width: none;
            }

            table {
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;

              page-break-after: auto;
            }

            .catalog-row {
              page-break-after: avoid;
            }

          }

        </style>

      </head>

      <body>

        <div class="report">

          <!-- =====================
               TITLE
          ====================== -->

          <div class="title">

            <h1>
              PHIẾU KIỂM TRA HỆ THỐNG IT
            </h1>

            <p>
              ${item.title}
            </p>

          </div>


          <!-- =====================
               TICKET INFO
          ====================== -->

          <div class="info">

            <div class="info-row">

              <div class="info-label">
                Người thực hiện
              </div>

              <div class="info-value">
                ${requester}
              </div>

            </div>


            <div class="info-row">

              <div class="info-label">
                Ngày kiểm tra
              </div>

              <div class="info-value">
                ${createdAt}
              </div>

            </div>

          </div>


          <!-- =====================
               CHECKLIST TABLE
          ====================== -->

          <table>

            <thead>

              <tr>

                <th class="stt">
                  STT
                </th>

                <th class="name">
                  CÁC MỤC KIỂM TRA
                </th>

                <th class="status">
                  KẾT QUẢ
                </th>

                <th class="note">
                  GHI CHÚ
                </th>

              </tr>

            </thead>


            <tbody>

              ${catalogHTML}

            </tbody>

          </table>


          <!-- =====================
               FOOTER
          ====================== -->

          <div class="footer">

            <div>
              Generated from IT Checklist System
            </div>

            <div>
              ${new Date().toLocaleString(
                "vi-VN"
              )}
            </div>

          </div>

        </div>

      </body>

      </html>
    `;

    // ==========================================
    // 6. WEB
    // ==========================================

    console.log("========== BEFORE WEB PRINT ==========");
    console.log("Platform:", Platform.OS);

    if (Platform.OS === "web") {
      const printWindow = window.open(
        "",
        "_blank"
      );
    
      if (!printWindow) {
        Alert.alert(
          "Popup Blocked",
          "Please allow pop-ups for this website."
        );
        return;
      }
    
      printWindow.document.open();
    
      printWindow.document.write(html);
    
      printWindow.document.close();
    
      // Đổi tên trang thay vì about:blank
      printWindow.document.title =
        "CheckList Report";
    
        try {
          console.log("CALLING PRINT");
        
          printWindow.focus();
        
          console.log("FOCUS DONE");
        
          printWindow.print();
        
          console.log("PRINT DONE");
        } catch (error) {
          console.error("PRINT ERROR:", error);
        }
    
      return;
    }

    // ==========================================
    // 7. IOS / ANDROID
    // ==========================================

    const result =
      await Print.printToFileAsync({
        html,
      });

    if (!result?.uri) {

      throw new Error(
        "Could not create PDF file."
      );
    }

    console.log(
      "PDF created:",
      result.uri
    );

    // ==========================================
    // 8. SHARE PDF
    // ==========================================

    const sharingAvailable =
      await Sharing.isAvailableAsync();

    if (sharingAvailable) {

      await Sharing.shareAsync(
        result.uri,
        {
          mimeType:
            "application/pdf",

          dialogTitle:
            "Share Checklist Report",

          UTI:
            "com.adobe.pdf",
        }
      );

    } else {

      Alert.alert(
        "PDF Created",
        "The PDF was created successfully."
      );

    }

  } catch (error: any) {

    console.error(
      "Export PDF Error:",
      error
    );

    Alert.alert(
      "Export PDF Error",
      error?.message ||
        "Failed to export checklist PDF."
    );
  }
};
  
  const filteredPosts = posts

  // TIME FILTER
  .filter((item) => {
    const created = new Date(item.created_at);
    const now = new Date();

    if (timeFilter === "Today") {
      return created.toDateString() === now.toDateString();
    }

    if (timeFilter === "This Week") {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      return created >= start;
    }

    if (timeFilter === "This Month") {
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }

    if (timeFilter === "This Year") {
      return created.getFullYear() === now.getFullYear();
    }

    return true;
  })

  // SEARCH
  .filter((item) => {
    if (!search.trim()) return true;

    const keyword = search.toLowerCase();

    return (
      item.title?.toLowerCase().includes(keyword) ||
      item.profiles?.name?.toLowerCase().includes(keyword)
    );
  });
  
  const totalPages = Math.ceil(
    filteredPosts.length / ITEMS_PER_PAGE
  );
  
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            zIndex: 9999,
          }}
        >
          {/* SEARCH */}
          <View
            style={{
              flex: 1,
            }}
          >
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

          {/* TIME */}
          <View
            style={{
              position: "relative",
              zIndex: 9999,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                setShowTimeDropdown(
                  !showTimeDropdown
                )
              }
              style={{
                backgroundColor: "#f3f4f6",
                paddingVertical: 12,
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
                  right: 0,
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
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setTimeFilter(option);
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
                          timeFilter === option
                            ? "#4f46e5"
                            : "#111827",
                        fontWeight:
                          timeFilter === option
                            ? "700"
                            : "500",
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#f3f4f6",
            borderRadius: 12,
            padding: 4,
            marginBottom: 12,
          }}
        >
          {/* CHECKLIST */}
          <TouchableOpacity
            onPress={() => setActiveTab("checklist")}
            style={{
              flex: 1,
              paddingVertical: 11,
              borderRadius: 9,
              alignItems: "center",
              backgroundColor:
                activeTab === "checklist"
                  ? "#ffffff"
                  : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color:
                  activeTab === "checklist"
                    ? "#4f46e5"
                    : "#6b7280",
              }}
            >
              ✓ Checklist
            </Text>
          </TouchableOpacity>

          {/* OTHER */}
          <TouchableOpacity
            onPress={() => setActiveTab("other")}
            style={{
              flex: 1,
              paddingVertical: 11,
              borderRadius: 9,
              alignItems: "center",
              backgroundColor:
                activeTab === "other"
                  ? "#ffffff"
                  : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color:
                  activeTab === "other"
                    ? "#4f46e5"
                    : "#6b7280",
              }}
            >
              Other
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* LIST */}
        {isLoading ? (
          <Text style={{ color: "#666" }}>Loading...</Text>
        ) : (
          <FlatList
            data={
              activeTab === "checklist"
                ? checklistTickets
                : otherTickets
            }
            keyExtractor={(item) =>
              item.id.toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
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

                {item.work_time ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 8,
                    }}
                  >
                    ✅ Completed: {formatTime(item.work_time)}
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      marginBottom: 8,
                    }}
                  >
                    📝 Created: {formatTime(item.created_at)}
                  </Text>
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

                {item.checklist &&
                item.checklist.length > 0 ? (
                  <>
                  <View
                    style={{
                      marginTop: 12,
                      borderWidth: 1,
                      borderColor: "#9ca3af",
                      backgroundColor: "#fff",
                      overflow: "hidden",
                    }}
                  >

                    {/* =========================
                        TABLE HEADER
                    ========================= */}
                    <View
                      style={{
                        flexDirection: "row",
                        backgroundColor: "#f3f4f6",
                        borderBottomWidth: 1,
                        borderBottomColor: "#9ca3af",
                      }}
                    >

                      {/* STT */}
                      <View
                        style={{
                          width: 42,
                          paddingVertical: 7,
                          paddingHorizontal: 4,
                          borderRightWidth: 1,
                          borderRightColor: "#9ca3af",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            textAlign: "center",
                            color: "#374151",
                          }}
                        >
                          STT
                        </Text>
                      </View>

                      {/* NAME */}
                      <View
                        style={{
                          flex: 1,
                          paddingVertical: 7,
                          paddingHorizontal: 6,
                          borderRightWidth: 1,
                          borderRightColor: "#9ca3af",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: "#374151",
                          }}
                        >
                          CÁC MỤC KIỂM TRA
                        </Text>
                      </View>

                      {/* STATUS */}
                      <View
                        style={{
                          width: 100,
                          paddingVertical: 7,
                          paddingHorizontal: 3,
                          borderRightWidth: 1,
                          borderRightColor: "#9ca3af",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            textAlign: "center",
                            color: "#374151",
                          }}
                        >
                          KẾT QUẢ
                        </Text>
                      </View>

                      {/* NOTE */}
                      <View
                        style={{
                          width: 600,
                          paddingVertical: 7,
                          paddingHorizontal: 5,
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: "#374151",
                          }}
                        >
                          GHI CHÚ
                        </Text>
                      </View>

                    </View>


                    {/* =========================
                        GROUP BY CATALOG
                    ========================= */}

                    {Object.entries(
                      item.checklist.reduce(
                        (
                          groups: Record<string, any[]>,
                          checklistItem: any
                        ) => {
                          const catalog =
                            checklistItem.catalog_name ||
                            "Other";

                          if (!groups[catalog]) {
                            groups[catalog] = [];
                          }

                          groups[catalog].push(
                            checklistItem
                          );

                          return groups;
                        },
                        {}
                      )
                    ).map(
                      (
                        [catalogName, checklistItems],
                        catalogIndex
                      ) => (

                        <View key={catalogName}>

                          {/* =========================
                              CATALOG ROW
                          ========================= */}

                          <View
                            style={{
                              flexDirection: "row",
                              backgroundColor: "#f9fafb",
                              borderBottomWidth: 1,
                              borderBottomColor: "#9ca3af",
                            }}
                          >

                            {/* CATALOG STT */}
                            <View
                              style={{
                                width: 42,
                                paddingVertical: 6,
                                paddingHorizontal: 4,
                                borderRightWidth: 1,
                                borderRightColor: "#9ca3af",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: "700",
                                  color: "#111827",
                                  textAlign: "center",
                                }}
                              >
                                {catalogIndex + 1}.
                              </Text>
                            </View>


                            {/* CATALOG NAME */}
                            <View
                              style={{
                                flex: 1,
                                paddingVertical: 6,
                                paddingHorizontal: 6,
                                borderRightWidth: 1,
                                borderRightColor: "#9ca3af",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: "700",
                                  color: "#111827",
                                }}
                              >
                                {catalogName}
                              </Text>
                            </View>


                            {/* EMPTY STATUS */}
                            <View
                              style={{
                                width: 100,
                                borderRightWidth: 1,
                                borderRightColor: "#9ca3af",
                              }}
                            />


                            {/* EMPTY NOTE */}
                            <View
                              style={{
                                width: 600,
                              }}
                            />

                          </View>


                          {/* =========================
                              CHECKLIST ITEMS
                          ========================= */}

                          {(checklistItems as any[]).map(
                            (
                              checkItem: any,
                              itemIndex: number
                            ) => (

                              <View
                                key={
                                  checkItem.id ??
                                  `${catalogName}-${itemIndex}`
                                }
                                style={{
                                  flexDirection: "row",
                                  borderBottomWidth: 1,
                                  borderBottomColor: "#d1d5db",
                                  minHeight: 34,
                                }}
                              >

                                {/* =====================
                                    STT
                                ===================== */}

                                <View
                                  style={{
                                    width: 42,
                                    paddingVertical: 6,
                                    paddingHorizontal: 3,
                                    borderRightWidth: 1,
                                    borderRightColor: "#d1d5db",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10,
                                      color: "#374151",
                                      textAlign: "center",
                                    }}
                                  >
                                    {catalogIndex + 1}.
                                    {itemIndex + 1}
                                  </Text>
                                </View>


                                {/* =====================
                                    CHECKLIST NAME
                                ===================== */}

                                <View
                                  style={{
                                    flex: 1,
                                    paddingVertical: 6,
                                    paddingHorizontal: 6,
                                    borderRightWidth: 1,
                                    borderRightColor: "#d1d5db",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      color: "#111827",
                                      lineHeight: 15,
                                    }}
                                  >
                                    {checkItem.name}
                                  </Text>
                                </View>


                                {/* =====================
                                    STATUS
                                ===================== */}

                                <View
                                  style={{
                                    width: 100,
                                    paddingVertical: 6,
                                    paddingHorizontal: 3,
                                    borderRightWidth: 1,
                                    borderRightColor: "#d1d5db",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10,
                                      fontWeight: "700",
                                      color:
                                        checkItem.status ===
                                        "OK"
                                          ? "#15803d"
                                          : checkItem.status ===
                                            "NOT OK"
                                          ? "#dc2626"
                                          : "#6b7280",
                                    }}
                                  >
                                    {checkItem.status || "-"}
                                  </Text>
                                </View>


                                {/* =====================
                                    NOTE
                                ===================== */}

                                <View
                                  style={{
                                    width: 600,
                                    paddingVertical: 6,
                                    paddingHorizontal: 5,
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10,
                                      color: "#4b5563",
                                      lineHeight: 14,
                                    }}
                                    numberOfLines={3}
                                  >
                                    {checkItem.note || "-"}
                                  </Text>
                                </View>

                              </View>

                            )
                          )}

                        </View>

                      )
                    )}

                  </View>

                  <TouchableOpacity
                  onPress={() => exportChecklistPDF(item)}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#111827",
                    paddingVertical: 11,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                  >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    📄 Export PDF
                  </Text>
                  </TouchableOpacity>
                  </>

                ) : (
                  
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#6b7280",
                      lineHeight: 20,
                    }}
                  >
                    {item.description}
                  </Text>
                )}  
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
        {totalPages > 1 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
            style={{
              backgroundColor:
                page === 1 ? "#d1d5db" : "#4f46e5",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff" }}>
              Previous
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            {page} / {totalPages}
          </Text>

          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
            style={{
              backgroundColor:
                page === totalPages
                  ? "#d1d5db"
                  : "#4f46e5",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff" }}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
      </View>


    </SafeAreaView>
  );
}