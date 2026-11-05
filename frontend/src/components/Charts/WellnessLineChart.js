import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Colors from '../../theme/colors';

const screenWidth = Dimensions.get('window').width - 32;

export default function WellnessLineChart({ data = [30, 45, 60, 75, 85, 70, 90] }) {
  const chartWidth = Math.max(280, screenWidth - 32);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Weekly Consistency Trend</Text>
        <Text style={styles.badge}>Avg {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}%</Text>
      </View>
      <LineChart
        data={{
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              data: data,
              strokeWidth: 3,
            }
          ]
        }}
        width={chartWidth}
        height={190}
        yAxisSuffix="%"
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#064E3B",
            fill: "#10B981"
          },
          propsForBackgroundLines: {
            stroke: "#F1F5F9",
            strokeWidth: 1,
            strokeDasharray: ""
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.greenLight,
    color: '#065F46',
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  chart: {
    marginVertical: 4,
    borderRadius: 16,
    alignSelf: 'center',
  }
});
