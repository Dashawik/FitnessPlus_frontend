<template>
    <HeaderTabs />
    <div class="training-types-container">
        <div class="content-wrapper">
            <h2>Weekly Training Calendar</h2>
            <el-button v-if="isAdmin || isTrainer" type="success" size="small" @click="showAddEventDialog"
                class="add-button">
                <el-icon>
                    <Plus />
                </el-icon>
                Add Training
            </el-button>
            <div v-if="isLoading" class="skeleton-wrapper">
                <el-skeleton :rows="5" animated />
            </div>
            <div class="weekly-calendar-container">
                <div class="calendar-controls">
                    <button @click="prevWeek" class="control-btn">←</button>
                    <span class="week-range">{{ startDate }} - {{ endDate }}</span>
                    <button @click="nextWeek" class="control-btn">→</button>
                </div>
                <table v-if="!isLoading" class="weekly-calendar-table">
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
                                    <li v-for="(training, tIdx) in getEventsForSlot(hour, day.fullDate)" :key="tIdx"
                                        @click="viewTrainingDetails(training)" class="event-item"
                                        :class="{ 'booked': training.usedSpots >= training.availableSpots }">
                                        <div class="event-detail">Training: {{ training.type.name }}</div>
                                        <div class="event-detail">Trainer: {{ training.trainer.firstName }} {{
                                            training.trainer.lastName }}</div>
                                        <div class="event-detail">Time: {{ formatTime(training.startTime) }} - {{
                                            formatTime(training.endTime) }}</div>
                                        <div class="event-detail">Spots: {{ training.availableSpots - training.usedSpots
                                        }} / {{ training.availableSpots }}</div>
                                        <div v-if="isAdmin || (isTrainer && training.trainer.id === userId && training.typeId === 1)"
                                            class="event-actions">
                                            <el-button type="text" @click.stop="editTraining(training)">Edit</el-button>
                                            <el-button type="text"
                                                @click.stop="deleteTraining(training.id)">Delete</el-button>
                                        </div>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <el-dialog v-model="bookingDialogVisible" title="Book Training" width="30%"
                :before-close="handleCloseDialog" class="centered-dialog">
                <el-form :model="bookingForm" :rules="bookingRules" ref="bookingForm" label-position="top"
                    class="centered-form">
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="bookingForm.name" placeholder="Enter your name" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="bookingDialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="confirmBooking">
                            <el-icon style="margin-right: 8px">
                                <Check />
                            </el-icon>
                            Confirm
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <el-dialog v-model="addEventDialogVisible" title="Add/Edit Training" width="40%"
                :before-close="handleCloseDialog" class="centered-dialog">
                <el-form :model="newTraining" :rules="trainingRules" ref="trainingForm" label-position="top"
                    class="centered-form">
                    <el-form-item label="Type" prop="typeId">
                        <el-select v-model="newTraining.typeId" placeholder="Select training type" style="width: 100%"
                            v-if="isAdmin">
                            <el-option v-for="type in trainingTypes" :key="type.id" :label="type.name"
                                :value="type.id" />
                        </el-select>
                        <el-input v-else v-model="newTraining.typeId" disabled value="1" />
                    </el-form-item>
                    <el-form-item label="Trainer" prop="trainerId" v-if="isAdmin">
                        <el-select v-model="newTraining.trainerId" placeholder="Select trainer" style="width: 100%">
                            <el-option v-for="trainer in trainers" :key="trainer.id"
                                :label="`${trainer.firstName} ${trainer.lastName}`" :value="trainer.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Start Time" prop="startTime">
                        <el-date-picker v-model="newTraining.startTime" type="datetime" placeholder="Select start time"
                            style="width: 100%" @change="updateEndTime" :first-day-of-week="1" />
                    </el-form-item>
                    <el-form-item label="End Time" prop="endTime">
                        <el-date-picker v-model="newTraining.endTime" type="datetime" placeholder="Select end time"
                            style="width: 100%" :first-day-of-week="1" />
                    </el-form-item>
                    <el-form-item label="Available Spots" prop="availableSpots">
                        <el-input v-model.number="newTraining.availableSpots" type="number"
                            placeholder="Enter available spots" :disabled="!isAdmin" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="addEventDialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="saveTraining">
                            <el-icon style="margin-right: 8px">
                                <Check />
                            </el-icon>
                            Save
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <el-dialog v-model="trainingDetailsVisible" title="Training Details" width="30%"
                :before-close="handleCloseDialog" class="centered-dialog">
                <div v-if="selectedTraining">
                    <p><strong>Training:</strong> {{ selectedTraining.type.name }}</p>
                    <p><strong>Trainer:</strong> {{ selectedTraining.trainer.firstName }} {{
                        selectedTraining.trainer.lastName }}
                    </p>
                    <p><strong>Time:</strong> {{ formatTime(selectedTraining.startTime) }} - {{
                        formatTime(selectedTraining.endTime)
                    }}</p>
                    <p><strong>Spots:</strong> {{ selectedTraining.availableSpots - selectedTraining.usedSpots }} / {{
                        selectedTraining.availableSpots }}</p>
                </div>
                <template #footer v-if="isUser">
                    <span class="dialog-footer">
                        <el-button @click="trainingDetailsVisible = false">Close</el-button>
                        <el-button type="primary" @click="bookEventFromDetails"
                            :disabled="selectedTraining.usedSpots >= selectedTraining.availableSpots">
                            <el-icon style="margin-right: 8px">
                                <Check />
                            </el-icon>
                            Book
                        </el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Plus, Check } from '@element-plus/icons-vue'
import { getTrainingListAPI, createTrainingAPI, updateTrainingAPI, deleteTrainingAPI } from '@/api/training'
import { getTrainingTypeListAPI } from '@/api/training/type'
import { getTrainersAPI } from '@/api/user'
import Cookies from 'js-cookie'
import HeaderTabs from '@/components/HeaderTabs.vue'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/uk'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('auto')

export default {
    name: 'WeeklyTrainingCalendar',
    components: {
        Plus,
        Check,
        HeaderTabs
    },
    data() {
        return {
            isLoading: false,
            currentDate: dayjs().tz(dayjs.tz.guess()).startOf('day'),
            daysOfWeek: [],
            trainings: {},
            bookingDialogVisible: false,
            addEventDialogVisible: false,
            trainingDetailsVisible: false,
            bookingForm: { name: '', date: '', time: '', training: null },
            bookingRules: {
                name: [{ required: true, message: 'Please enter your name', trigger: 'blur' }]
            },
            newTraining: {
                id: null,
                typeId: null,
                trainerId: null,
                startTime: null,
                endTime: null,
                availableSpots: 1,
                usedSpots: 0
            },
            trainingRules: {
                typeId: [{ required: true, message: 'Please select training type', trigger: 'change' }],
                trainerId: [{ required: true, message: 'Please select trainer', trigger: 'change' }],
                startTime: [{ required: true, message: 'Please select start time', trigger: 'change' }],
                endTime: [{ required: true, message: 'Please select end time', trigger: 'change' }],
                availableSpots: [{ required: true, message: 'Please enter available spots', trigger: 'blur' }]
            },
            trainers: [],
            trainingTypes: [],
            selectedTraining: null,
            userRole: null,
            userId: null
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
            for (const date in this.trainings) {
                for (const training of this.trainings[date] || []) {
                    allHours.add(this.formatTime(training.startTime))
                }
            }
            return Array.from(allHours).sort()
        },
        isAdmin() {
            return this.userRole === 'ADMIN'
        },
        isTrainer() {
            return this.userRole === 'TRAINER'
        },
        isUser() {
            return this.userRole === 'USER'
        }
    },
    async created() {
        this.currentDate = dayjs().tz(dayjs.tz.guess()).startOf('day')
        while (this.currentDate.day() !== 1) {
            this.currentDate = this.currentDate.subtract(1, 'day')
        }
        const user = Cookies.get('user')
        const data = JSON.parse(user || '{}')
        this.userRole = data.role
        this.userId = data.id
        await this.loadTrainings()
        this.generateWeek()
    },
    methods: {
        async loadTrainings() {
            this.isLoading = true
            const start = this.currentDate.startOf('day').toISOString()
            const end = this.currentDate.endOf('week').toISOString()
            try {
                const data = await getTrainingListAPI(start, end)
                console.log('API response:', data)
                this.trainings = this.groupTrainingsByDate(data)
            } catch (error) {
                ElMessage.error('Failed to load trainings: ' + error.message)
            } finally {
                this.isLoading = false
            }
        },
        groupTrainingsByDate(trainings) {
            const grouped = {}
            trainings.forEach(training => {
                const date = dayjs(training.startTime).tz(dayjs.tz.guess())
                const dateKey = date.format('YYYY-MM-DD')
                if (!grouped[dateKey]) grouped[dateKey] = []
                grouped[dateKey].push(training)
            })
            return grouped
        },
        generateWeek() {
            const week = []
            const firstDay = this.currentDate
            for (let i = 0; i < 7; i++) {
                const date = firstDay.add(i, 'day').tz(dayjs.tz.guess())
                week.push({
                    day: date.format('ddd'),
                    date: date.format('DD.MM.YYYY'),
                    fullDate: date.format('YYYY-MM-DD')
                })
            }
            this.daysOfWeek = week
        },
        isCurrentDay(date) {
            const today = dayjs().tz(dayjs.tz.guess()).format('YYYY-MM-DD')
            return date === today
        },
        formatTime(dateTime) {
            return dayjs(dateTime).tz(dayjs.tz.guess()).format('HH:mm')
        },
        getEventsForSlot(hour, date) {
            return this.trainings[date]?.filter(training => this.formatTime(training.startTime) === hour) || []
        },
        viewTrainingDetails(training) {
            this.selectedTraining = training
            this.trainingDetailsVisible = true
        },
        bookEventFromDetails() {
            if (this.selectedTraining.usedSpots < this.selectedTraining.availableSpots) {
                this.bookingForm = {
                    name: '',
                    date: dayjs(this.selectedTraining.startTime).tz(dayjs.tz.guess()).format('YYYY-MM-DD'),
                    time: this.formatTime(this.selectedTraining.startTime),
                    training: this.selectedTraining
                }
                this.bookingDialogVisible = true
                this.trainingDetailsVisible = false
            } else {
                ElMessage.warning('This training is fully booked or no spots available!')
            }
        },
        showAddEventDialog() {
            this.newTraining = {
                id: null,
                typeId: this.isTrainer ? 1 : null,
                trainerId: this.isTrainer ? this.userId : null,
                startTime: null,
                endTime: null,
                availableSpots: this.isTrainer ? 1 : null,
                usedSpots: 0
            }
            this.addEventDialogVisible = true
            if (this.isAdmin) {
                this.loadInitialData()
            }
            this.updateEndTime()
        },
        async loadInitialData() {
            try {
                this.trainingTypes = await getTrainingTypeListAPI()
                this.trainers = await getTrainersAPI()
            } catch (error) {
                ElMessage.error('Failed to load initial data: ' + error.message)
            }
        },
        updateEndTime() {
            if (this.newTraining.startTime) {
                this.newTraining.endTime = dayjs(this.newTraining.startTime).add(55, 'minute').toDate()
            }
        },
        editTraining(training) {
            if (this.isAdmin || (this.isTrainer && training.trainer.id === this.userId)) {
                this.newTraining = { ...training }
                this.addEventDialogVisible = true
                if (this.isAdmin) {
                    this.loadInitialData()
                }
            } else {
                ElMessage.warning('Only the trainer can edit their own unbooked trainings, or admin can edit any.')
            }
        },
        async deleteTraining(trainingId) {
            if (this.isAdmin || (this.isTrainer && Object.values(this.trainings).some(trainingsArray => trainingsArray.some(t => t.id === trainingId && t.trainer.id === this.userId)))) {
                try {
                    await deleteTrainingAPI(trainingId)
                    this.loadTrainings()
                    ElMessage.success('Training deleted successfully')
                } catch (error) {
                    ElMessage.error('Failed to delete training: ' + error.message)
                }
            } else {
                ElMessage.warning('Only the trainer can delete their own trainings, or admin can delete any.')
            }
        },
        async saveTraining() {
            this.$refs.trainingForm.validate(async (valid) => {
                if (valid) {
                    try {
                        const startTime = this.newTraining.startTime instanceof Date ? this.newTraining.startTime.toISOString() : dayjs(this.newTraining.startTime).toISOString()
                        const endTime = this.newTraining.endTime instanceof Date ? this.newTraining.endTime.toISOString() : dayjs(this.newTraining.endTime).toISOString()
                        if (this.newTraining.id) {
                            await updateTrainingAPI(this.newTraining.id, {
                                ...this.newTraining,
                                startTime,
                                endTime
                            })
                            ElMessage.success('Training updated successfully')
                        } else {
                            await createTrainingAPI(
                                startTime,
                                endTime,
                                this.newTraining.typeId,
                                this.newTraining.trainerId,
                                this.newTraining.availableSpots
                            )
                            ElMessage.success('Training added successfully')
                        }
                        this.addEventDialogVisible = false
                        await this.loadTrainings()
                    } catch ({ response }) {
                        if (response?.data?.details) {
                            const { details } = response.data
                            details.forEach((detail) => {
                                ElMessage.error(detail)
                            })
                        } else {
                            ElMessage.error('An error occurred, please try again later')
                        }
                    }
                }
            })
        },
        async confirmBooking() {
            this.$refs.bookingForm.validate(async (valid) => {
                if (valid) {
                    const training = this.bookingForm.training
                    if (training.usedSpots < training.availableSpots) {
                        training.usedSpots++
                        ElMessage.success(`Booked ${training.type.name} with ${training.trainer.firstName} ${training.trainer.lastName} on ${this.bookingForm.date} at ${this.bookingForm.time} for ${this.bookingForm.name}`)
                        this.bookingDialogVisible = false
                        await this.updateTrainingBooking(training.id, this.bookingForm.name)
                    } else {
                        ElMessage.error('No available spots left!')
                    }
                }
            })
        },
        async updateTrainingBooking(trainingId, userName) {
            return new Promise(resolve => {
                setTimeout(() => {
                    ElMessage.success(`Booking confirmed for ${userName} on training ID ${trainingId}`)
                    resolve()
                }, 500)
            })
        },
        prevWeek() {
            this.currentDate = this.currentDate.subtract(7, 'day')
            this.loadTrainings()
            this.generateWeek()
        },
        nextWeek() {
            this.currentDate = this.currentDate.add(7, 'day')
            this.loadTrainings()
            this.generateWeek()
        },
        handleCloseDialog(done) {
            this.$confirm('Are you sure you want to close this dialog?', 'Warning', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning'
            }).then(() => {
                done()
            })
        }
    }
}
</script>

<style scoped>
.training-types-container {
    width: 100%;
    padding-left: 24px;
    padding-right: 24px;
    min-height: 100vh;
    display: flex;
    justify-content: center;
}

.content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
    padding-top: 0;
}

h2 {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
    text-align: center;
}

.skeleton-wrapper {
    width: 100%;
    padding: 16px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.weekly-calendar-container {
    width: 100%;
    padding: 24px;
    min-height: 100vh;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
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
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
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
    position: relative;
}

.event-detail {
    margin: 2px 0;
    word-wrap: break-word;
}

.event-actions {
    margin-top: 5px;
    display: flex;
    justify-content: center;
    gap: 8px;
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

.add-button {
    margin-bottom: 16px;
    align-self: flex-start;
    width: 200px;
}

.add-button :deep(.el-icon) {
    width: 1em;
    height: 1em;
    margin-right: 8px;
}

.el-button {
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
}

.el-button:hover {
    background-color: #165dff;
}

.el-button :deep(.el-icon) {
    margin-right: 8px;
}

.el-input__inner {
    border-radius: 8px;
    padding: 12px;
}

.el-select {
    width: 100%;
}

.centered-dialog .el-dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.centered-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.centered-form .el-form-item {
    width: 80%;
    text-align: center;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 80%;
}

@media (max-width: 768px) {
    .training-types-container {
        padding: 16px;
    }

    .content-wrapper {
        padding-top: 0;
    }

    h2 {
        font-size: 20px;
    }

    .weekly-calendar-container {
        padding: 16px;
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

    .add-button {
        width: 180px;
    }

    .add-button :deep(.el-icon) {
        width: 0.9em;
        height: 0.9em;
    }

    .centered-form .el-form-item {
        width: 90%;
    }

    .dialog-footer {
        width: 90%;
    }
}
</style>