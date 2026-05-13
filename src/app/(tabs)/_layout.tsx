import { NativeTabs } from "expo-router/unstable-native-tabs";
import "react-datepicker/dist/react-datepicker.css";

import { Link, Slot, usePathname } from "expo-router";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export default function TabsLayout() {

  // ✅ WEB SIDEBAR
  if (Platform.OS === "web") {
    return <WebSidebar />;
  }

  // ✅ MOBILE TABS
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"house"} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tickets">
        <NativeTabs.Trigger.Label>Tickets</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"ticket"} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create">
        <NativeTabs.Trigger.Label>Create</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"plus"} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="noti">
        <NativeTabs.Trigger.Label>Noti</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"bell"} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"person"} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function WebSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menus = [
    {
      name: "Home",
      href: "/",
      icon: "🏠",
    },
    {
      name: "Tickets",
      href: "/tickets",
      icon: "🎫",
    },
    {
      name: "Create",
      href: "/create",
      icon: "➕",
    },
    {
      name: "Noti",
      href: "/noti",
      icon: "🔔",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: "👤",
    },
  ];

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      
      {/* SIDEBAR */}
      {!collapsed && (
        <View
          style={{
            width: 240,
            backgroundColor: "#111827",
            paddingTop: 24,
            paddingHorizontal: 12,
          }}
        >
          {/* HEADER SIDEBAR */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              Ticket App
            </Text>
  
            {/* CLOSE */}
            <TouchableOpacity
              onPress={() => setCollapsed(true)}
              style={{
                padding: 8,
                borderRadius: 10,
                backgroundColor: "#1f2937",
                cursor: "pointer" as any,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "bold",
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>
  
          {/* MENUS */}
          {menus.map((item) => {
            const active = pathname === item.href;
  
            return (
              <Link
                key={item.href}
                href={item.href as any}
                asChild
              >
                <TouchableOpacity
                  onPress={() => setCollapsed(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    marginBottom: 10,
                    backgroundColor:
                      active ? "#4f46e5" : "transparent",
                    cursor: "pointer" as any,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      marginRight: 12,
                    }}
                  >
                    {item.icon}
                  </Text>
  
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              </Link>
            );
          })}
        </View>
      )}
  
      {/* PAGE */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
        }}
      >
        {/* TOP BAR */}
        {collapsed && (
          <View
            style={{
              height: 60,
              borderBottomWidth: 1,
              borderBottomColor: "#eef0f2",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setCollapsed(false)}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: "#f3f4f6",
                cursor: "pointer" as any,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                }}
              >
                ☰
              </Text>
            </TouchableOpacity>
          </View>
        )}
  
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    </View>
  );
}