import { ChartData } from "chart.js";

export type DoughnutChartData = ChartData<"doughnut", number[]>;
export type BarChartData = ChartData<"bar", number[]>;
export type Analysis = "activity"|"participations"|"punctuality";

export function isAnalysis(obj: any): obj is Analysis {
    return ["activity", "participations", "punctuality"].includes(obj);
}