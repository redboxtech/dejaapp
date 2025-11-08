import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { AgendaScreen } from "@screens/Agenda/AgendaScreen";
import { HomeScreen } from "@screens/Home/HomeScreen";
import { MedicationsScreen } from "@screens/Medications/MedicationsScreen";
import { ProfileScreen } from "@screens/Profile/ProfileScreen";
import { colors } from "@theme/index";
import { AppTabParamList } from "./types";

const Tab = createBottomTabNavigator<AppTabParamList>();

const ICONS: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Agenda: "calendar",
  Medications: "medkit",
  Profile: "person"
};

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          paddingBottom: 18,
          paddingTop: 0,
          height: 82
        },
        tabBarLabelStyle: {
          fontSize: 12
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = ICONS[route.name];
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Início" }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ tabBarLabel: "Agenda" }}
      />
      <Tab.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{ tabBarLabel: "Medicações" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
};

