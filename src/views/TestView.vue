<template>
    <div class="weekly-calendar-container">
        <h2>Weekly Training Calendar</h2>
        <div class="calendar-controls">
            <button @click="prevWeek" class="control-btn">←</button>
            <span class="week-range">{{ startDate }} - {{ endDate }}</span>
            <button @click="nextWeek" class="control-btn">→</button>
        </div>
        <table class="weekly-calendar-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th v-for="day in daysOfWeek" :key="day.date" class="day-header">
                        {{ day.day }}<br>{{ day.date }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="hour in uniqueHours" :key="hour">
                    <td class="time-slot">{{ hour }}</td>
                    <td v-for="day in daysOfWeek" :key="day.date" class="calendar-cell"
                        :class="{ 'current-day': isCurrentDay(day.fullDate) }">
                        <ul class="events" v-if="getEventsForSlot(hour, day.fullDate).length">
                            <li v-for="(event, eIdx) in getEventsForSlot(hour, day.fullDate)" :key="eIdx"
                                @click="bookEvent(day.fullDate, hour, event)" class="event-item"
                                :class="{ 'booked': event.booked }">
                                <div class="event-detail">Training: {{ event.type }}</div>
                                <div class="event-detail">Trainer: {{ event.trainer.name }}</div>
                                <div class="event-detail">Time: {{ event.startTime }} - {{ event.endTime }}</div>
                                <div class="event-detail">Spots: {{ event.availableSpots }}</div>
                            </li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
        <el-dialog v-model="bookingDialogVisible" title="Book Training" width="30%">
            <el-form :model="bookingForm" :rules="bookingRules" ref="bookingForm">
                <el-form-item label="Name" prop="name">
                    <el-input v-model="bookingForm.name" placeholder="Enter your name" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="bookingDialogVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="confirmBooking">Confirm</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
    name: 'WeeklyTrainingCalendar',
    data() {
        return {
            currentDate: new Date(2025, 5, 30), // 30 червня 2025, понеділок
            daysOfWeek: [],
            bookingDialogVisible: false,
            bookingForm: { name: '', date: '', time: '', event: null },
            bookingRules: {
                name: [{ required: true, message: 'Please enter your name', trigger: 'blur' }]
            }
        }
    },
    computed: {
        startDate() {
            return this.daysOfWeek[0] ? this.daysOfWeek[0].date : ''
        },
        endDate() {
            return this.daysOfWeek[6] ? this.daysOfWeek[6].date : ''
        },
        uniqueHours() {
            const allHours = new Set()
            for (const date in this.testEvents) {
                for (const hour in this.testEvents[date]) {
                    allHours.add(hour)
                }
            }
            return Array.from(allHours).sort()
        },
        testEvents() {
            return {
                '2025-06-30': {
                    '09:00': [
                        { type: 'Yoga', trainer: { id: 1, name: 'Anna' }, startTime: '09:00', endTime: '10:00', availableSpots: 5, booked: true },
                        { type: 'Meditation', trainer: { id: 2, name: 'John' }, startTime: '09:00', endTime: '09:30', availableSpots: 3, booked: true }
                    ],
                    '14:00': [
                        { type: 'Pilates', trainer: { id: 2, name: 'John' }, startTime: '14:00', endTime: '15:00', availableSpots: 3, booked: true }
                    ]
                },
                '2025-07-01': {
                    '10:00': [
                        { type: 'Jump', trainer: { id: 3, name: 'Maria' }, startTime: '10:00', endTime: '11:00', availableSpots: 4, booked: false }
                    ],
                    '16:00': [
                        { type: 'Yoga', trainer: { id: 1, name: 'Anna' }, startTime: '16:00', endTime: '17:00', availableSpots: 6, booked: false },
                        { type: 'Stretch', trainer: { id: 2, name: 'John' }, startTime: '16:00', endTime: '16:30', availableSpots: 2, booked: false }
                    ]
                },
                '2025-07-02': {
                    '11:00': [
                        { type: 'Pilates', trainer: { id: 2, name: 'John' }, startTime: '11:00', endTime: '12:00', availableSpots: 2, booked: false }
                    ],
                    '17:00': [
                        { type: 'Jump', trainer: { id: 3, name: 'Maria' }, startTime: '17:00', endTime: '18:00', availableSpots: 5, booked: false }
                    ],
                    '00:30': [
                        { type: 'Morning Stretch', trainer: { id: 1, name: 'Anna' }, startTime: '00:30', endTime: '01:00', availableSpots: 4, booked: false }
                    ]
                },
                '2025-07-03': {
                    '09:30': [
                        { type: 'Yoga', trainer: { id: 1, name: 'Anna' }, startTime: '09:30', endTime: '10:30', availableSpots: 3, booked: false }
                    ],
                    '15:00': [
                        { type: 'Pilates', trainer: { id: 2, name: 'John' }, startTime: '15:00', endTime: '16:00', availableSpots: 4, booked: false }
                    ]
                },
                '2025-07-04': {
                    '13:00': [
                        { type: 'Jump', trainer: { id: 3, name: 'Maria' }, startTime: '13:00', endTime: '14:00', availableSpots: 5, booked: false }
                    ],
                    '18:00': [
                        { type: 'Yoga', trainer: { id: 1, name: 'Anna' }, startTime: '18:00', endTime: '19:00', availableSpots: 2, booked: false }
                    ]
                },
                '2025-07-05': {
                    '10:30': [
                        { type: 'Pilates', trainer: { id: 2, name: 'John' }, startTime: '10:30', endTime: '11:30', availableSpots: 3, booked: false }
                    ]
                },
                '2025-07-06': {
                    '14:00': [
                        { type: 'Jump', trainer: { id: 3, name: 'Maria' }, startTime: '14:00', endTime: '15:00', availableSpots: 4, booked: false }
                    ]
                }
            }
        }
    },
    created() {
        this.generateWeek()
    },
    methods: {
        generateWeek() {
            const week = []
            const firstDay = new Date(this.currentDate)
            while (firstDay.getDay() !== 1) {
                firstDay.setDate(firstDay.getDate() - 1)
            }
            for (let i = 0; i < 7; i++) {
                const date = new Date(firstDay)
                date.setDate(firstDay.getDate() + i)
                week.push({
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    fullDate: date.toISOString().split('T')[0]
                })
            }
            this.daysOfWeek = week
        },
        isCurrentDay(date) {
            const today = new Date().toISOString().split('T')[0]
            return date === today
        },
        isBooked(date, hour) {
            const event = this.getEventsForSlot(hour, date)[0]
            return event?.booked || false
        },
        getEventsForSlot(hour, date) {
            return this.testEvents[date]?.[hour] || []
        },
        bookEvent(date, time, event) {
            if (event.booked || event.availableSpots <= 0) {
                ElMessage.warning('This event is fully booked or no spots available!')
                return
            }
            this.bookingForm = { name: '', date, time, event }
            this.bookingDialogVisible = true
        },
        async confirmBooking() {
            this.$refs.bookingForm.validate(async (valid) => {
                if (valid) {
                    const event = this.bookingForm.event
                    if (event.availableSpots > 0) {
                        event.availableSpots--
                        event.booked = true
                        ElMessage.success(`Booked ${event.type} with ${event.trainer.name} on ${this.bookingForm.date} at ${this.bookingForm.time} for ${this.bookingForm.name}`)
                        this.bookingDialogVisible = false
                        // Тут можна додати API-виклик для оновлення в базі
                        // await updateEventBooking(this.bookingForm.date, this.bookingForm.time, this.bookingForm.name)
                    } else {
                        ElMessage.error('No available spots left!')
                    }
                }
            })
        },
        prevWeek() {
            this.currentDate.setDate(this.currentDate.getDate() - 7)
            this.generateWeek()
        },
        nextWeek() {
            this.currentDate.setDate(this.currentDate.getDate() + 7)
            this.generateWeek()
        }
    }
}
</script>

<style scoped>
.weekly-calendar-container {
    width: 100%;
    padding: 24px;
    min-height: 100vh;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    margin: 0 auto;
    max-width: 1200px;
}

h2 {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    text-align: center;
    margin-bottom: 16px;
}

.calendar-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

.week-range {
    font-size: 18px;
    font-weight: 500;
    margin: 0 20px;
}

.control-btn {
    background: #409eff;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.control-btn:hover {
    background: #165dff;
}

.weekly-calendar-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
}

.weekly-calendar-table th,
.weekly-calendar-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
    vertical-align: middle;
}

.day-header {
    background: #f5f7fa;
    font-weight: 500;
    min-width: 120px;
}

.time-slot {
    background: #f5f7fa;
    font-weight: 500;
    width: 80px;
}

.calendar-cell {
    min-height: 60px;
    position: relative;
}

.events {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 12px;
    color: #666;
}

.event-item {
    cursor: pointer;
    padding: 2px 0;
}

.event-detail {
    margin: 2px 0;
    word-wrap: break-word;
}

.event-item:hover {
    background: #f0f0f0;
}

.booked {
    background: #e0e0e0;
    opacity: 0.7;
}

.current-day {
    background: #e6f0fa;
    border: 2px solid #409eff;
}

@media (max-width: 768px) {
    .weekly-calendar-container {
        padding: 16px;
    }

    h2 {
        font-size: 20px;
    }

    .week-range {
        font-size: 16px;
    }

    .control-btn {
        padding: 6px 10px;
        font-size: 14px;
    }

    .weekly-calendar-table th,
    .weekly-calendar-table td {
        padding: 8px;
    }

    .day-header {
        min-width: 100px;
    }

    .time-slot {
        width: 60px;
    }

    .calendar-cell {
        min-height: 50px;
    }

    .events {
        font-size: 10px;
    }

    .event-detail {
        font-size: 10px;
    }
}
</style>