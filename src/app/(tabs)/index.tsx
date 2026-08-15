import { usePosts } from "@/hooks/usePosts";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "expo-router";
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  LineChart
} from "react-native-chart-kit";

import Svg, {
  Circle,
  G,
} from "react-native-svg";

import {
  useEffect,
  useState,
} from "react";

import { SafeAreaView } from "react-native-safe-area-context";


export default function Home() {
  const router = useRouter();
  const { posts, isLoading, refetch } = usePosts();
  const [weekOffset, setWeekOffset] = useState(0);

  const [totalUsers, setTotalUsers] = useState(0);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    loadTotalUsers();
  }, []);

  const loadTotalUsers = async () => {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      });
  
    if (error) {
      console.error(
        "Load total users error:",
        error
      );
      return;
    }
  
    setTotalUsers(count ?? 0);
  };

  // =========================
  // DASHBOARD STATS
  // =========================

  const today = new Date();

  const isSameDay = (date: Date, target: Date) => {
    return (
      date.getFullYear() === target.getFullYear() &&
      date.getMonth() === target.getMonth() &&
      date.getDate() === target.getDate()
    );
  };

  const todayPosts = posts.filter((post) =>
    isSameDay(new Date(post.created_at), today)
  );

  const totalTickets = todayPosts.length;

  const checklistTickets = todayPosts.filter(
    (post: any) =>
      post.ticket_type === "Checklist" ||
      (
        Array.isArray(post.checklist) &&
        post.checklist.length > 0
      )
  );

  const otherTickets = todayPosts.filter(
    (post: any) =>
      !(
        Array.isArray(post.checklist) &&
        post.checklist.length > 0
      )
  );

  const notOkItems = todayPosts.reduce(
    (total: number, post: any) => {
      if (!post.checklist) return total;

      return (
        total +
        post.checklist.filter(
          (item: any) => item.status === "NOT OK"
        ).length
      );
    },
    0
  );

  // =========================
  // CHECKLIST COMPLETION
  // =========================

  const checklistStats = todayPosts.reduce(
    (
      result: {
        total: number;
        ok: number;
        notOk: number;
      },
      post: any
    ) => {
      if (!post.checklist) return result;

      post.checklist.forEach((item: any) => {
        result.total++;

        if (item.status === "OK") {
          result.ok++;
        }

        if (item.status === "NOT OK") {
          result.notOk++;
        }
      });

      return result;
    },
    {
      total: 0,
      ok: 0,
      notOk: 0,
    }
  );

  const completionPercent =
    checklistStats.total > 0
      ? Math.round(
          (checklistStats.ok /
            checklistStats.total) *
            100
        )
      : 0;

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    valueColor = "#111827",
  }: {
    icon: string;
    title: string;
    value: number | string;
    subtitle: string;
    valueColor?: string;
  }) => {
    return (
      <View
        style={{
          flex: 1,
          minWidth: 180,
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: "#eef0f2",

          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 4,
          },

          elevation: 2,
        }}
      >
        {/* ICON */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: "#eef2ff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 20 }}>
            {icon}
          </Text>
        </View>

        {/* TITLE */}
        <Text
          style={{
            fontSize: 13,
            color: "#6b7280",
            fontWeight: "500",
          }}
        >
          {title}
        </Text>

        {/* VALUE */}
        <Text
          style={{
            marginTop: 4,
            fontSize: 28,
            fontWeight: "800",
            color: valueColor,
          }}
        >
          {value}
        </Text>

        {/* SUBTITLE */}
        <Text
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          {subtitle}
        </Text>
      </View>
    );
  };

  const ChecklistCompletionCard = ({
    total,
    ok,
    notOk,
    percent,
  }: {
    total: number;
    ok: number;
    notOk: number;
    percent: number;
  }) => {
    // =========================
    // PENDING
    // =========================
    const pending = Math.max(
      total - ok - notOk,
      0
    );

    // =========================
    // PERCENTAGE
    // =========================
    const okPercent =
      total > 0
        ? Math.round((ok / total) * 100)
        : 0;

    const notOkPercent =
      total > 0
        ? Math.round((notOk / total) * 100)
        : 0;

    const pendingPercent =
      total > 0
        ? Math.round((pending / total) * 100)
        : 0;

    // =========================
    // DONUT
    // =========================
    const size = 210;
    const strokeWidth = 28;
    const radius =
      (size - strokeWidth) / 2;

    const circumference =
      2 * Math.PI * radius;

    const okLength =
      (okPercent / 100) *
      circumference;

    const notOkLength =
      (notOkPercent / 100) *
      circumference;

    return (
      <View
        style={{
          flex: 1,
          minWidth: 360,
          backgroundColor: "#ffffff",
          borderRadius: 18,
          padding: 20,
          borderWidth: 1,
          borderColor: "#eef0f2",

          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 4,
          },

          elevation: 2,
        }}
      >
        {/* =========================
            TITLE
        ========================= */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: "#111827",
            marginBottom: 16,
          }}
        >
          Checklist Completion
        </Text>

        {/* =========================
            CONTENT
        ========================= */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            minHeight: 230,
          }}
        >
          {/* =========================
              DONUT CHART
          ========================= */}
          <View
            style={{
              width: 220,
              height: 220,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* =====================
                  BACKGROUND / PENDING
              ===================== */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#cbd5e1"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* =====================
                  OK
              ===================== */}
              {okPercent > 0 && (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#22c55e"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${okLength} ${
                    circumference - okLength
                  }`}
                  strokeDashoffset={0}
                  strokeLinecap="butt"
                  rotation="-90"
                  origin={`${size / 2}, ${
                    size / 2
                  }`}
                />
              )}

              {/* =====================
                  NOT OK
              ===================== */}
              {notOkPercent > 0 && (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#ef4444"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${notOkLength} ${
                    circumference - notOkLength
                  }`}
                  strokeDashoffset={
                    -okLength
                  }
                  strokeLinecap="butt"
                  rotation="-90"
                  origin={`${size / 2}, ${
                    size / 2
                  }`}
                />
              )}
            </Svg>

            {/* =====================
                CENTER
            ===================== */}
            <View
              style={{
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                {percent}%
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                Hoàn thành
              </Text>
            </View>
          </View>

          {/* =========================
              LEGEND
          ========================= */}
          <View
            style={{
              flex: 1,
              paddingLeft: 10,
            }}
          >
            {/* OK */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor:
                    "#22c55e",
                  marginRight: 10,
                }}
              />

              <Text
                style={{
                  fontSize: 14,
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                OK
              </Text>

              <Text
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  color: "#111827",
                  fontWeight: "700",
                }}
              >
                {ok} ({okPercent}%)
              </Text>
            </View>

            {/* NOT OK */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor:
                    "#ef4444",
                  marginRight: 10,
                }}
              />

              <Text
                style={{
                  fontSize: 14,
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                NOT OK
              </Text>

              <Text
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  color: "#111827",
                  fontWeight: "700",
                }}
              >
                {notOk} ({notOkPercent}%)
              </Text>
            </View>

            {/* PENDING */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor:
                    "#cbd5e1",
                  marginRight: 10,
                }}
              />

              <Text
                style={{
                  fontSize: 14,
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                Pending
              </Text>

              <Text
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  color: "#111827",
                  fontWeight: "700",
                }}
              >
                {pending} ({pendingPercent}%)
              </Text>
            </View>
          </View>
        </View>

        {/* =========================
            TOTAL
        ========================= */}
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Tổng: {total} items
        </Text>
      </View>
    );
  };

  const TicketsOverviewCard = ({
    data,
  }: {
    data: {
      labels: string[];
      checklist: number[];
      other: number[];
      notOk: number[];
    };
  }) => {
    const screenWidth =
      Dimensions.get("window").width;

    const chartWidth = Math.min(
      screenWidth - 90,
      650
    );

    const maxValue = Math.max(
      ...data.checklist,
      ...data.other,
      ...data.notOk,
      1
    );

    let chartMax = maxValue;

    if (chartMax <= 5) {
      chartMax = 5;
    } else {
      chartMax =
        Math.ceil(chartMax / 5) * 5;
    }

    return (
      <View
        style={{
          flex: 1,
          minWidth: 360,
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 20,
          borderWidth: 1,
          borderColor: "#eef0f2",

          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 4,
          },

          elevation: 2,
        }}
      >
        {/* =========================
            HEADER
        ========================= */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 10,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#111827",
              }}
            >
              Tickets Overview
            </Text>

            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#9ca3af",
              }}
            >
              Tickets created this week
            </Text>
          </View>
        </View>

        {/*  */}
        <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              {/* PREVIOUS */}
              <TouchableOpacity
                onPress={() =>
                  setWeekOffset((prev) => prev - 1)
                }
                style={{
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  ← Previous
                </Text>
              </TouchableOpacity>

              {/* CURRENT RANGE */}
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Tickets Overview
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginTop: 2,
                  }}
                >
                  {formatShortDate(startOfWeek)} -{" "}
                  {formatShortDate(lastDayOfWeek)}
                </Text>
              </View>

              {/* NEXT */}
              <TouchableOpacity
                onPress={() =>
                  setWeekOffset((prev) => prev + 1)
                }
                style={{
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Next →
                </Text>
              </TouchableOpacity>
            </View>

        {/* =========================
            LINE CHART
        ========================= */}
        <View
          style={{
            marginTop: 8,
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <LineChart
            data={{
              labels: data.labels,
              datasets: [
                {
                  data: data.checklist,
                  color: (
                    opacity = 1
                  ) =>
                    `rgba(37, 99, 235, ${opacity})`,
                  strokeWidth: 2,
                },
              
                {
                  data: data.other,
                  color: (
                    opacity = 1
                  ) =>
                    `rgba(156, 163, 175, ${opacity})`,
                  strokeWidth: 2,
                },
              
                {
                  data: data.notOk,
                  color: (
                    opacity = 1
                  ) =>
                    `rgba(239, 68, 68, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={chartWidth}
            height={230}
            fromZero
            fromNumber={chartMax}
            segments={5}
            yAxisInterval={1}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines
            withDots
            bezier
            formatYLabel={(value) =>
              Math.round(
                Number(value)
              ).toString()
            }
            chartConfig={{
              backgroundGradientFrom:
                "#ffffff",
              backgroundGradientTo:
                "#ffffff",

              decimalPlaces: 0,

              color: (
                opacity = 1
              ) =>
                `rgba(37, 99, 235, ${opacity})`,

              labelColor: (
                opacity = 1
              ) =>
                `rgba(107, 114, 128, ${opacity})`,

              propsForBackgroundLines: {
                strokeDasharray: "4 6",
                stroke:
                  "#e5e7eb",
                strokeWidth: 1,
              },

              propsForLabels: {
                fontSize: 10,
              },

              fillShadowGradient:
                "#2563eb",

              fillShadowGradientOpacity:
                0.08,
            }}
            style={{
              borderRadius: 12,
              marginLeft: -12,
            }}
          />
        </View>

        {/* =========================
            LEGEND
        ========================= */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 6,
            gap: 18,
          }}
        >
          {/* CHECKLIST */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                backgroundColor:
                  "#2563eb",
                marginRight: 6,
              }}
            />

            <Text
              style={{
                fontSize: 11,
                color: "#6b7280",
              }}
            >
              Checklist
            </Text>
          </View>

          {/* OTHER */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                backgroundColor:
                  "#9ca3af",
                marginRight: 6,
              }}
            />

            <Text
              style={{
                fontSize: 11,
                color: "#6b7280",
              }}
            >
              Other
            </Text>
          </View>

          {/* NOT OK */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                backgroundColor:
                  "#ef4444",
                marginRight: 6,
              }}
            />

            <Text
              style={{
                fontSize: 11,
                color: "#ef4444",
              }}
            >
              NOT OK
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const CatalogOverviewCard = ({
    data,
  }: {
    data: {
      name: string;
      value: number;
    }[];
  }) => {
    const total = data.reduce(
      (sum, item) => sum + item.value,
      0
    );
  
    const catalogCount = data.length;
  
    const topCatalog =
      data.length > 0
        ? data.reduce((prev, current) =>
            current.value > prev.value
              ? current
              : prev
          )
        : null;
  
    // =========================
    // COLORS
    // =========================
  
    const catalogColors = [
      "#4f46e5",
      "#06b6d4",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#f97316",
      "#64748b",
    ];
  
    // =========================
    // DONUT
    // =========================
  
    const size = 170;
    const strokeWidth = 22;
    const radius =
      (size - strokeWidth) / 2;
  
    const circumference =
      2 * Math.PI * radius;
  
    let accumulated = 0;
  
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: "#eef0f2",
          minHeight: 280,
        }}
      >
        {/* HEADER */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Tickets by Catalog
        </Text>
  
        <Text
          style={{
            fontSize: 12,
            color: "#9ca3af",
            marginTop: 3,
          }}
        >
          Checklist distribution
        </Text>
  
        {/* DONUT */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: 18,
          }}
        >
          <View
            style={{
              width: size,
              height: size,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* BACKGROUND RING */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#eef2ff"
                strokeWidth={
                  strokeWidth
                }
                fill="none"
              />
  
              {/* CATALOG SEGMENTS */}
              <G
                rotation="-90"
                origin={`${size / 2}, ${
                  size / 2
                }`}
              >
                {data.map(
                  (item, index) => {
                    if (total === 0) {
                      return null;
                    }
  
                    const percentage =
                      item.value /
                      total;
  
                    const segmentLength =
                      circumference *
                      percentage;
  
                    const dashOffset =
                      -circumference *
                      accumulated;
  
                    accumulated +=
                      percentage;
  
                    return (
                      <Circle
                        key={`${item.name}-${index}`}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={
                          catalogColors[
                            index %
                              catalogColors.length
                          ]
                        }
                        strokeWidth={
                          strokeWidth
                        }
                        fill="none"
                        strokeDasharray={`${segmentLength} ${
                          circumference -
                          segmentLength
                        }`}
                        strokeDashoffset={
                          dashOffset
                        }
                        strokeLinecap="butt"
                      />
                    );
                  }
                )}
              </G>
            </Svg>
  
            {/* CENTER */}
            <View
              style={{
                position:
                  "absolute",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                {total}
              </Text>
  
              <Text
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  marginTop: 2,
                }}
              >
                CHECKLIST ITEMS
              </Text>
            </View>
          </View>
        </View>
  
        {/* LEGEND */}
        <View
          style={{
            marginTop: 16,
          }}
        >
          {data.map(
            (item, index) => {
              const percent =
                total > 0
                  ? Math.round(
                      (item.value /
                        total) *
                        100
                    )
                  : 0;
  
              return (
                <View
                  key={`${item.name}-${index}`}
                  style={{
                    flexDirection:
                      "row",
                    alignItems:
                      "center",
                    marginBottom: 8,
                  }}
                >
                  {/* COLOR DOT */}
                  <View
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 999,
                      backgroundColor:
                        catalogColors[
                          index %
                            catalogColors.length
                        ],
                      marginRight: 8,
                    }}
                  />
  
                  {/* NAME */}
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: "#374151",
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
  
                  {/* VALUE */}
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#111827",
                      width: 30,
                      textAlign:
                        "right",
                    }}
                  >
                    {item.value}
                  </Text>
  
                  {/* PERCENT */}
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      width: 40,
                      textAlign:
                        "right",
                      marginLeft: 5,
                    }}
                  >
                    {percent}%
                  </Text>
                </View>
              );
            }
          )}
        </View>
      </View>
    );
  };

  const RecentTicketsCard = ({
    posts,
  }: {
    posts: any[];
  }) => {
    const recentTickets = [...posts]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: "#eef0f2",
          minHeight: 280,
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Recent Tickets
          </Text>
  
          <TouchableOpacity
            onPress={() =>
              router.push("/(tabs)/tickets")
            }
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#2563eb",
              }}
            >
              View all
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* TICKETS */}
        {recentTickets.map(
          (item, index) => {
            const isChecklist =
              Array.isArray(item.checklist) &&
              item.checklist.length > 0;

            const isOther = !isChecklist;
  
            const status =
              item.status || "Open";
  
            const createdTime =
              new Date(
                item.created_at
              ).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );
  
            return (
              <View
                key={
                  item.id ||
                  index
                }
                style={{
                  flexDirection:
                    "row",
                  alignItems:
                    "center",
                  paddingVertical: 10,
                  borderBottomWidth:
                    index ===
                    recentTickets.length -
                      1
                      ? 0
                      : 1,
                  borderBottomColor:
                    "#f1f5f9",
                }}
              >
                {/* ICON */}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor:
                      "#eff6ff",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                    }}
                  >
                    📄
                  </Text>
                </View>
  
                {/* CONTENT */}
                <View
                  style={{
                    flex: 1,
                    marginRight: 8,
                  }}
                >
                  {/* TITLE */}
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {item.title || "Untitled Ticket"}
                  </Text>

                  {/* USER + TIME */}
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginTop: 3,
                    }}
                  >
                    {item.profiles?.name || "Unknown User"} • {createdTime}
                  </Text>
                </View>
  
                {/* TYPE */}
                <View
                  style={{
                    backgroundColor:
                      isChecklist
                        ? "#ecfdf5"
                        : "#f5f3ff",
                    paddingVertical: 4,
                    paddingHorizontal: 7,
                    borderRadius: 6,
                    marginRight: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight:
                        "700",
                      color:
                        isChecklist
                          ? "#059669"
                          : "#7c3aed",
                    }}
                  >
                    {isChecklist
                      ? "CHECKLIST"
                      : isOther
                      ? "OTHER"
                      : "TICKET"}
                  </Text>
                </View>
  
                {/* STATUS */}
                <View
                  style={{
                    backgroundColor:
                      status ===
                      "Completed"
                        ? "#ecfdf5"
                        : status ===
                          "NOT OK"
                        ? "#fef2f2"
                        : "#eff6ff",
                    paddingVertical: 4,
                    paddingHorizontal: 7,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight:
                        "700",
                      color:
                        status ===
                        "Completed"
                          ? "#059669"
                          : status ===
                            "NOT OK"
                          ? "#dc2626"
                          : "#2563eb",
                    }}
                  >
                    {status
                      .toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          }
        )}
  
        {/* EMPTY */}
        {recentTickets.length ===
          0 && (
          <View
            style={{
              flex: 1,
              alignItems:
                "center",
              justifyContent:
                "center",
            }}
          >
            <Text
              style={{
                color:
                  "#9ca3af",
                fontSize: 13,
              }}
            >
              No recent tickets
            </Text>
          </View>
        )}
      </View>
    );
  };

  const weeklyData = () => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
  
    const now = new Date();
  
    // start tuần
    const startOfWeek = new Date(now);
  
    startOfWeek.setDate(
      now.getDate() -
        ((now.getDay() + 6) % 7) +
        weekOffset * 7
    );
  
    startOfWeek.setHours(0, 0, 0, 0);
  
    // labels
    const labels = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
  
      day.setDate(startOfWeek.getDate() + i);
  
      return day.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      });
    });
  
    const endOfWeek = new Date(startOfWeek);
  
    endOfWeek.setDate(startOfWeek.getDate() + 7);
  
    posts.forEach((post) => {
      const created = new Date(post.created_at);
  
      if (
        created >= startOfWeek &&
        created < endOfWeek
      ) {
        let day = created.getDay();
  
        day = day === 0 ? 6 : day - 1;
  
        counts[day]++;
      }
    });

    return {
      labels,
      datasets: [
        {
          data: counts,
        },
      ],
    };
  };

  const now = new Date();

  const startOfWeek = new Date(now);

  startOfWeek.setDate(
    now.getDate() -
      ((now.getDay() + 6) % 7) +
      weekOffset * 7
  );

  const endOfWeek = new Date(startOfWeek);

  endOfWeek.setDate(
    startOfWeek.getDate() + 7
  );

  const lastDayOfWeek = new Date(startOfWeek);

  lastDayOfWeek.setDate(
    startOfWeek.getDate() + 6
  );

  const formatShortDate = (date: Date) => {
    return `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
  };

  const chartData = weeklyData();

  const ticketOverviewData = (() => {
    const labels = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
  
    const checklist = [
      0, 0, 0, 0, 0, 0, 0,
    ];
  
    const other = [
      0, 0, 0, 0, 0, 0, 0,
    ];
  
    const notOk = [
      0, 0, 0, 0, 0, 0, 0,
    ];
  
    posts.forEach((post: any) => {
      const created = new Date(
        post.created_at
      );
  
      if (
        created >= startOfWeek &&
        created < new Date(
          startOfWeek.getTime() +
            7 * 24 * 60 * 60 * 1000
        )
      ) {
        let day = created.getDay();
  
        day =
          day === 0
            ? 6
            : day - 1;
  
        // =========================
        // CHECKLIST
        // =========================
        const isChecklist =
          post.ticket_type === "Checklist" ||
          (
            Array.isArray(post.checklist) &&
            post.checklist.length > 0
          );
  
        if (isChecklist) {
          checklist[day]++;
        }
  
        // =========================
        // OTHER
        // =========================
        const isOther = !isChecklist;
  
        if (isOther) {
          other[day]++;
        }
  
        // =========================
        // NOT OK
        // =========================
        if (
          Array.isArray(post.checklist)
        ) {
          const hasNotOk =
            post.checklist.some(
              (item: any) =>
                item.status === "NOT OK"
            );
  
          if (hasNotOk) {
            notOk[day]++;
          }
        }
      }
    });
    
  
    console.log(
      "Tickets Overview:",
      {
        checklist,
        other,
        notOk,
      }
    );
  
    return {
      labels,
      checklist,
      other,
      notOk,
    };
  })();

  const catalogData = (() => {
    const counts: Record<string, number> = {};
  
    posts.forEach((post: any) => {
      // Chỉ lấy ticket Checklist
      if (
        !Array.isArray(post.checklist) ||
        post.checklist.length === 0
      ) {
        return;
      }
  
      post.checklist.forEach((checkItem: any) => {
        const catalog =
          checkItem.catalog_name ||
          "Other";
  
        counts[catalog] =
          (counts[catalog] || 0) + 1;
      });
    });
  
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
      }));
  })();

  console.log(
    "Catalog Data:",
    catalogData
  );

  const rawMax = Math.max(
    ...chartData.datasets[0].data
  );
  
  let chartMax = 5;
  let segments = 5;
  
  if (rawMax === 0) {
    chartMax = 1;
    segments = 1;
  } else if (rawMax <= 5) {
    chartMax = 5;
    segments = 5;
  } else {
    chartMax = Math.ceil(rawMax / 5) * 5;
    segments = 5;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={[]}
        renderItem={null as any}
        keyExtractor={(_, index) => index.toString()}
  
        refreshing={isLoading}
        onRefresh={refetch}
  
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            
            {/* HEADER */}
            <View
              style={{
                marginBottom: 22,
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                Dashboard
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: "#6b7280",
                }}
              >
                Tổng quan hệ thống kiểm tra IT
              </Text>
            </View>
  
            {/* KPI CARDS */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 14,
                marginBottom: 22,
              }}
            >
              <StatCard
                icon="📋"
                title="Tổng Tickets"
                value={totalTickets}
                subtitle="Hôm nay"
              />

              <StatCard
                icon="✓"
                title="Checklist"
                value={checklistTickets.length}
                subtitle="Hôm nay"
                valueColor="#16a34a"
              />

              <StatCard
                icon="📄"
                title="Other Tickets"
                value={otherTickets.length}
                subtitle="Hôm nay"
                valueColor="#f59e0b"
              />

              <StatCard
                icon="👥"
                title="Total Users"
                value={totalUsers}
                subtitle="Đang hoạt động"
              />

              <StatCard
                icon="⚠️"
                title="NOT OK Items"
                value={notOkItems}
                subtitle="Cần xử lý"
                valueColor="#dc2626"
              />
            </View>    

            {/* DASHBOARD ANALYTICS */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 22,
              }}
            >
              <ChecklistCompletionCard
                total={checklistStats.total}
                ok={checklistStats.ok}
                notOk={checklistStats.notOk}
                percent={completionPercent}
              />

              <TicketsOverviewCard
                data={ticketOverviewData}
              />

            </View>

              {/* CATALOG + RECENT TICKETS */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 16,
                  marginBottom: 22,
                }}
              >
                <CatalogOverviewCard
                  data={catalogData}
                />

                <RecentTicketsCard
                  posts={posts}
                />
              </View>
  
            {/* FOOTER */}
            <View
              style={{
                marginTop: 24,
                marginBottom: 40,
              }}
            >
              <Text
                style={{
                  color: "#9ca3af",
                  textAlign: "center",
                }}
              >
                {isLoading
                  ? "Loading dashboard..."
                  : "Dashboard updated"}
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}