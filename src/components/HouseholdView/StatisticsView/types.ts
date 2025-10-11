import { ChartData } from "chart.js";

export type DoughnutChartData = ChartData<"doughnut", number[], unknown>;
export type BarChartData = ChartData<"bar", number[], unknown>;
export type Analysis = "activity"|"participations"|"punctuality";

export function isAnalysis(obj: any): obj is Analysis {
    return ["activity", "participations", "punctuality"].includes(obj);
}