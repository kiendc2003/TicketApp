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
      <View
        style={{
          width: collapsed ? 80 : 240,
          backgroundColor: "#111827",
          paddingTop: 24,
          paddingHorizontal: 12,
        }}
      >
  
        {/* LOGO */}
        <Text
          style={{
            color: "#fff",
            fontSize: collapsed ? 20 : 24,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {collapsed ? "🎫" : "Ticket App"}
        </Text>
  
        {/* TOGGLE BUTTON */}
        <TouchableOpacity
          onPress={() => setCollapsed(!collapsed)}
          style={{
            backgroundColor: "#1f2937",
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: 24,
            cursor: "pointer" as any,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
            }}
          >
            {collapsed ? "➡️" : "⬅️"}
          </Text>
        </TouchableOpacity>
  
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
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: collapsed
                    ? "center"
                    : "flex-start",
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  marginBottom: 10,
                  backgroundColor: active
                    ? "#4f46e5"
                    : "transparent",
                  cursor: "pointer" as any,
                }}
              >
                {/* ICON */}
                <Text
                  style={{
                    fontSize: 18,
                    marginRight: collapsed ? 0 : 12,
                  }}
                >
                  {item.icon}
                </Text>
  
                {/* LABEL */}
                {!collapsed && (
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {item.name}
                  </Text>
                )}
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
  
      {/* PAGE */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
        }}
      >
        <Slot />
      </View>
    </View>
  );
}