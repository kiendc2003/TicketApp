import { usePosts } from "@/hooks/usePosts";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
  const { posts, isLoading, refetch } = usePosts();
  const [weekOffset, setWeekOffset] = useState(0);

  const stats = [

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

  const screenWidth = Dimensions.get("window").width;

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

  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatShortDate = (date: Date) => {
    return `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
  };

  const chartData = weeklyData();

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
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
              }}
            >
              Hello 👋
            </Text>
  
            <Text
              style={{
                color: "#666",
                marginBottom: 20,
              }}
            >
              Here’s your support overview
            </Text>

            {/* STATS */}
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
                    padding: 18,
                    borderRadius: 16,
                    marginRight:
                      index !== stats.length - 1
                        ? 10
                        : 0,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#eef0f2",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: item.color,
                      marginBottom: 6,
                    }}
                  >
                    {item.value}
                  </Text>

                  <Text
                    style={{
                      color: "#6b7280",
                      fontWeight: "500",
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
  
            {/* ACTION BUTTONS */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 24,
              }}
            >

              {/* REFRESH */}
              <TouchableOpacity
                onPress={refetch}
                disabled={isLoading}
                style={{
                  flex: 1,
                  backgroundColor: isLoading
                    ? "#9ca3af"
                    : "#111827",
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {isLoading
                    ? "⏳ Refreshing..."
                    : "🔄 Refresh"}
                </Text>
              </TouchableOpacity>

              {/* CREATE */}
              <TouchableOpacity
                onPress={() =>
                  router.push("/(tabs)/create")
                }
                style={{
                  flex: 1,
                  backgroundColor: "#4f46e5",
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  + Create Ticket
                </Text>
              </TouchableOpacity>
            </View>
            
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setWeekOffset((prev) => prev - 1)
                }
                style={{
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  ⬅ Previous
                </Text>
              </TouchableOpacity>

              <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                Week Overview
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                ({formatShortDate(startOfWeek)} - {formatShortDate(endOfWeek)})
              </Text>
            </View>

              <TouchableOpacity
                onPress={() =>
                  setWeekOffset((prev) => prev + 1)
                }
                style={{
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  Next ➡
                </Text>
              </TouchableOpacity>
            </View>
  
            {/* CHART CARD */}
            <View
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 18,
                paddingVertical: 16,
                paddingHorizontal: 8,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#eef0f2",
              }}
            >
              <LineChart
                data={{
                  ...chartData,
                  datasets: [
                    {
                      data: chartData.datasets[0].data,
                    },
                  ],
                }}
                width={
                  Platform.OS === "web"
                    ? 700
                    : screenWidth - 40
                }
                height={220}

                fromZero
                fromNumber={chartMax}
                segments={segments}
                yAxisInterval={1}
                yAxisSuffix=""
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,

                  color: (opacity = 1) =>
                    `rgba(79,70,229,${opacity})`,

                  labelColor: (opacity = 1) =>
                    `rgba(107,114,128,${opacity})`,
                }}
                bezier
                style={{
                  borderRadius: 16,
                }}
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