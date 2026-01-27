
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/card';

const data = [
    { name: 'Seg', desktop: 186, mobile: 80 },
    { name: 'Ter', desktop: 305, mobile: 200 },
    { name: 'Qua', desktop: 237, mobile: 120 },
    { name: 'Qui', desktop: 73, mobile: 190 },
    { name: 'Sex', desktop: 209, mobile: 130 },
    { name: 'Sáb', desktop: 214, mobile: 140 },
    { name: 'Dom', desktop: 250, mobile: 170 },
];

export function EngagementChart() {
    return (
        <Card className="w-full h-[350px]">
            <div className="p-6">
                <h3 className="font-semibold mb-4 text-lg">Engajamento Semanal</h3>
                <div className="w-full h-[250px] min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 10,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="desktop"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorDesktop)"
                            />
                            <Area
                                type="monotone"
                                dataKey="mobile"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMobile)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
}
