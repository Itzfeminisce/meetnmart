import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { WeeklyStatusChart } from "@/types";

// Transform the data to group by week and create stacked format
const transformData = (rawData: WeeklyStatusChart[]) => {
    const weeklyData = {} as WeeklyStatusChart;

    rawData.forEach(item => {
        const week = item.week.replace('2025-W', 'W');
        if (!weeklyData[week]) {
            weeklyData[week] = { week, released: 0, disputed: 0, rejected: 0, held: 0 };
        }
        weeklyData[week][item.status] = item.occurrence;
    });

    return Object.values(weeklyData).sort((a, b) =>
        parseInt(a.week.replace('W', '')) - parseInt(b.week.replace('W', ''))
    );
};

// Sample data - replace with your actual data
const rawChartData = [
    { "week": "2025-W20", "status": "released", "occurrence": 5 },
    { "week": "2025-W20", "status": "disputed", "occurrence": 1 },
    { "week": "2025-W21", "status": "released", "occurrence": 1 },
    { "week": "2025-W21", "status": "disputed", "occurrence": 2 },
    { "week": "2025-W21", "status": "rejected", "occurrence": 2 },
    { "week": "2025-W22", "status": "held", "occurrence": 1 }
];


const chartConfig = {
    released: {
        label: "Released",
        color: "hsl(142, 76%, 36%)", // Green
    },
    disputed: {
        label: "Disputed",
        color: "hsl(48, 96%, 53%)", // Yellow
    },
    rejected: {
        label: "Rejected",
        color: "hsl(0, 84%, 60%)", // Red
    },
    held: {
        label: "Held",
        color: "hsl(217, 91%, 60%)", // Blue
    },
} satisfies ChartConfig

export function SellerStat({data}: { data: WeeklyStatusChart[] }) {

    const chartData = transformData(data);


    const totalOccurrences = chartData.reduce((sum, week) =>
        sum + week.released + week.disputed + week.rejected + week.held, 0
    );

    const releasedPercentage = chartData.reduce((sum, week) => sum + week.released, 0) / totalOccurrences * 100;

    return (
        <Card className="glass-morphism">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                    Transaction Analysis
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                    Weekly transaction breakdown on call engagements
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 p-0 m-0 pr-1">
                <ChartContainer config={chartConfig} className="max-h-[12rem] p-0 m-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 12,
                                left: 12,
                                bottom: 10,
                            }}
                        >
                            <defs>
                                <linearGradient id="released" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="disputed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="rejected" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="held" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(148, 163, 184, 0.3)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="week"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                width={30}
                            />
                            <ChartTooltip
                                cursor={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-white/95 backdrop-blur-sm p-2 px-4 capitalize shadow-lg">
                                                <p className="text-xs text-gray-700 mb-1">{label}</p>
                                                <div className="space-y-0.5">
                                                    {payload.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center gap-1.5">
                                                            <div
                                                                className="w-1.5 h-1.5 rounded-full"
                                                                style={{ backgroundColor: entry.color }}
                                                            />
                                                            <span className="text-xs" style={{ color: entry.color }}>
                                                                {entry.name}: {entry.value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                dataKey="released"
                                stackId="1"
                                stroke="hsl(142, 76%, 36%)"
                                fill="url(#released)"
                                strokeWidth={2}
                            />
                            <Area
                                dataKey="disputed"
                                stackId="1"
                                stroke="hsl(48, 96%, 53%)"
                                fill="url(#disputed)"
                                strokeWidth={2}
                            />
                            <Area
                                dataKey="rejected"
                                stackId="1"
                                stroke="hsl(0, 84%, 60%)"
                                fill="url(#rejected)"
                                strokeWidth={2}
                            />
                            <Area
                                dataKey="held"
                                stackId="1"
                                stroke="hsl(217, 91%, 60%)"
                                fill="url(#held)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
                {/* Legend */}
                <div className="flex items-center justify-evenly flex-wrap gap-2">
                    {Object.entries(chartConfig).map(([key, config]) => (
                        <div key={key} className="md:flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: config.color }}
                            />
                            <span className="text-xs font-medium text-gray-600">
                                {config.label}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="pt-2 container">
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-1">
                        <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                            {releasedPercentage.toFixed(1)}% payments released <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-gray-500 text-xs">
                            {chartData.length} weeks of data • {totalOccurrences} total transactions
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}