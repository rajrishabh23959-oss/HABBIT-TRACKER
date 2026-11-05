import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Colors from '../../theme/colors';

let BarChart;
try {
  BarChart = require('react-native-chart-kit').BarChart;
} catch (e) {
  BarChart = null;
}

const screenWidth = Dimensions.get('window').width;

export default function DailyProgressBar({ dailyProgress = [], totalDays = 31 }) {
  const chartWidth = Math.min(screenWidth - 32, 600);

  const renderCustomBars = () => {
    return (
      <View style={styles.webChartContainer}>
        <View style={styles.barsRow}>
          {dailyProgress.map((val, index) => {
            const heightPct = Math.max(Math.min(val * 100, 100), 4);
            const isToday = index + 1 === new Date().getDate();
            return (
              <View key={index} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPct}%`,
                        backgroundColor: isToday ? Colors.primary : Colors.green,
                      },
                    ]}
                  />
                </View>
                {(index + 1) % 7 === 1 && (
                  <Text style={styles.barLabel}>{index + 1}</Text>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <Text style={styles.legendText}>0%</Text>
          <Text style={styles.legendText}>50%</Text>
          <Text style={styles.legendText}>100%</Text>
        </View>
      </View>
    );
  };

  const labels = Array.from({ length: totalDays }, (_, i) =>
    (i + 1) % 7 === 1 ? String(i + 1) : ''
  );

  const chartData = {
    labels,
    datasets: [{ data: dailyProgress.map(v => Math.round(v * 100)) }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Progress</Text>
      {Platform.OS === 'web' || !BarChart ? (
        renderCustomBars()
      ) : (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={110}
          yAxisSuffix="%"
          fromZero
          withInnerLines={false}
          showBarTops={false}
          chartConfig={{
            backgroundGradientFrom: Colors.surface,
            backgroundGradientTo: Colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76,175,80,${opacity})`,
            labelColor: () => Colors.textMuted,
            barPercentage: 0.55,
            propsForBackgroundLines: { strokeWidth: 0 },
            fillShadowGradient: Colors.green,
            fillShadowGradientOpacity: 1,
          }}
          style={styles.chart}
          withHorizontalLabels={true}
          segments={2}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.surface, // #F4F4F2
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border, // #E8E8E6
  },
  title: {
    color: Colors.textPrimary, // #0F332B
    fontWeight: '800',
    fontSize: 13,
    paddingHorizontal: 14,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  chart: {
    borderRadius: 12,
  },
  webChartContainer: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // #E8E8E6
    paddingBottom: 2,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    marginHorizontal: 1,
  },
  barTrack: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.border, // #E8E8E6 light gray track
    borderRadius: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 2,
  },
  barLabel: {
    color: Colors.textMuted, // #7A7A7A
    fontSize: 9,
    marginTop: 3,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  legendText: {
    color: Colors.textMuted, // #7A7A7A
    fontSize: 9,
  },
});
