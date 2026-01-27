import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Instagram, Facebook } from 'lucide-react';
import type { Post, CalendarDay } from '../types';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isToday,
    addMonths,
    subMonths,
    isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Calendar.css';

interface CalendarProps {
    posts: Post[];
    onPostClick: (post: Post) => void;
    onDateClick: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ posts, onPostClick, onDateClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const calendarDays: CalendarDay[] = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return days.map(date => ({
            date,
            posts: posts.filter(post => isSameDay(post.scheduledDate, date)),
            isCurrentMonth: isSameMonth(date, currentDate),
            isToday: isToday(date),
        }));
    }, [currentDate, posts]);

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const handlePrevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const getPlatformIcon = (platform: Post['platform']) => {
        if (platform === 'instagram') return <Instagram size={12} />;
        if (platform === 'facebook') return <Facebook size={12} />;
        return null;
    };

    return (
        <div className="calendar-view">
            <Card className="calendar-card">
                <CardContent className="p-4">
                    <div className="calendar-header">
                        <h2>{format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</h2>
                        <div className="calendar-nav">
                            <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                                <ChevronLeft size={20} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                                Hoje
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    </div>

                    <div className="calendar-grid">
                        {/* Week day headers */}
                        {weekDays.map(day => (
                            <div key={day} className="calendar-weekday">
                                {day}
                            </div>
                        ))}

                        {/* Calendar days */}
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
                                onClick={() => onDateClick(day.date)}
                            >
                                <div className="day-number">{format(day.date, 'd')}</div>

                                {day.posts.length > 0 && (
                                    <div className="day-posts">
                                        {day.posts.slice(0, 3).map(post => (
                                            <div
                                                key={post.id}
                                                className="post-indicator"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPostClick(post);
                                                }}
                                                title={post.caption.slice(0, 50)}
                                            >
                                                <span className="post-platform-icon">
                                                    {getPlatformIcon(post.platform)}
                                                </span>
                                                <span className="post-time">
                                                    {format(post.scheduledDate, 'HH:mm')}
                                                </span>
                                            </div>
                                        ))}
                                        {day.posts.length > 3 && (
                                            <div className="more-posts">
                                                +{day.posts.length - 3} mais
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card className="calendar-legend mt-4">
                <CardContent className="p-4">
                    <h4>Legenda</h4>
                    <div className="legend-items">
                        <div className="legend-item">
                            <Instagram size={16} color="var(--color-secondary)" />
                            <span>Instagram</span>
                        </div>
                        <div className="legend-item">
                            <Facebook size={16} color="var(--color-info)" />
                            <span>Facebook</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot today-dot"></div>
                            <span>Hoje</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
