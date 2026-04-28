import { NativeTabs } from "expo-router/unstable-native-tabs";
import "react-datepicker/dist/react-datepicker.css";

export default function TabsLayout() {
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
