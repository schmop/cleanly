import { ChartData } from "chart.js";

export type DoughnutChartData = ChartData<"doughnut", number[], unknown>;
export type BarChartData = ChartData<"bar", number[], unknown>;
export type Analysis = "participations"|"punctuality";