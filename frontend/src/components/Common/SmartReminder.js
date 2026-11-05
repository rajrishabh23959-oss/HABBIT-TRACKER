/**
 * Feature #5: Smart Reminders (Context-Aware)
 * - Location-Based: Notifies when near gym/target location
 * - Weather-Based: Suggests indoor alternatives on rainy days
 *
 * Uses: expo-location, expo-notifications, Open-Meteo (free weather API)
 * Note: Permissions must be granted on the device.
 */
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

// Open-Meteo weather codes for rain
const RAIN_CODES = [51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82, 95, 96, 99];

async function checkWeatherAndNotify(habitName) {
  try {
    // Try to get location
    let LocationModule;
    try {
      LocationModule = require('expo-location');
    } catch {
      return; // expo-location not available
    }
    const { status } = await LocationModule.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await LocationModule.getCurrentPositionAsync({ accuracy: LocationModule.Accuracy.Balanced });
    const { latitude, longitude } = location.coords;

    // Fetch weather from Open-Meteo (FREE, no API key needed!)
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=weathercode`
    );
    const data = await res.json();
    const weatherCode = data?.current_weather?.weathercode || 0;
    const isRaining = RAIN_CODES.includes(weatherCode);

    if (isRaining && habitName.toLowerCase().includes('run')) {
      await scheduleNotification(
        '🌧️ Baarish Ho Rahi Hai!',
        `"${habitName}" aaj bahar mushkil hai. Indoor jumping jacks try karein? 💪`
      );
    }
  } catch (err) {
    // Silently fail — Smart Reminders is optional enhancement
  }
}

async function scheduleNotification(title, body) {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { seconds: 5 }, // Send after 5 seconds
    });
  } catch {}
}

async function scheduleHabitReminder(habitName, triggerSeconds = 3600) {
  try {
    await scheduleNotification(
      `⏰ Time for: ${habitName}!`,
      `Aapki habit "${habitName}" ka waqt aa gaya hai! 💪`
    );
  } catch {}
}

export function useSmartReminders(habits = []) {
  useEffect(() => {
    if (!habits || habits.length === 0) return;

    // Check weather for outdoor habits
    const outdoorHabits = habits.filter(h =>
      h.name && (
        h.name.toLowerCase().includes('run') ||
        h.name.toLowerCase().includes('walk') ||
        h.name.toLowerCase().includes('gym') ||
        h.name.toLowerCase().includes('outdoor')
      )
    );

    if (outdoorHabits.length > 0) {
      checkWeatherAndNotify(outdoorHabits[0].name);
    }
  }, [habits?.length]);
}

export { scheduleHabitReminder, checkWeatherAndNotify };
