<template>

    <AppHeader />
    <HeaderTabs />
    <div class="training-types-container">
        <div class="content-wrapper">
            <h2>Training Types Management</h2>
            <el-button type="success" size="small" @click="openAddDialog" class="add-button">
                <el-icon>
                    <Plus />
                </el-icon>
                Add Training Type
            </el-button>
            <div v-if="isLoading" class="skeleton-wrapper">
                <el-skeleton :rows="5" animated />
            </div>
            <el-table v-else :data="trainingTypes" style="width: 100%" border class="centered-table"
                :cell-style="{ textAlign: 'center', padding: '12px' }"
                :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', fontWeight: '500', padding: '12px' }">
                <el-table-column prop="id" label="ID" min-width="100"></el-table-column>
                <el-table-column prop="name" label="Name" min-width="200"></el-table-column>
                <el-table-column prop="createdAt" label="Created At" min-width="200">
                    <template #default="scope">
                        {{ formatDate(scope.row.createdAt) }}
                    </template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="Updated At" min-width="200">
                    <template #default="scope">
                        {{ formatDate(scope.row.updatedAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="Actions" min-width="300">
                    <template #default="{ row }">
                        <div class="action-buttons">
                            <el-button type="primary" size="small" @click="openEditDialog(row)">
                                <el-icon style="margin-right: 8px">
                                    <Edit />
                                </el-icon>
                                Edit
                            </el-button>
                            <el-button type="danger" size="small" @click="deleteTrainingType(row)">
                                <el-icon style="margin-right: 8px">
                                    <Delete />
                                </el-icon>
                                Delete
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog title="Edit Training Type" v-model="editDialogVisible" width="30%"
                :before-close="handleCloseDialog" class="centered-dialog">
                <el-form ref="editForm" :model="editFormData" :rules="editRules" label-position="top"
                    class="centered-form">
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="editFormData.name" placeholder="Enter training type name">
                            <template #prefix>
                                <el-icon>
                                    <Document />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="editDialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="saveTrainingType">
                            <el-icon style="margin-right: 8px">
                                <Check />
                            </el-icon>
                            Save
                        </el-button>
                    </span>
                </template>
            </el-dialog>

            <el-dialog title="Add Training Type" v-model="addDialogVisible" width="30%"
                :before-close="handleCloseDialog" class="centered-dialog">
                <el-form ref="addForm" :model="newTrainingType" :rules="editRules" label-position="top"
                    class="centered-form">
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="newTrainingType.name" placeholder="Enter training type name">
                            <template #prefix>
                                <el-icon>
                                    <Document />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="addDialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="saveNewTrainingType">
                            <el-icon style="margin-right: 8px">
                                <Check />
                            </el-icon>
                            Save
                        </el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Edit, Delete, Document, Check, Plus } from '@element-plus/icons-vue'
import { getTrainingTypeListAPI, updateTrainingTypeAPI, deleteTrainingTypeAPI, createTrainingTypeAPI } from '@/api/training/type'
import HeaderTabs from '@/components/HeaderTabs.vue'
import AppHeader from '@/components/AppHeader.vue'

export default {
    name: 'TrainingTypesManagement',
    components: {
        Edit,
        Delete,
        Document,
        Check,
        Plus,
        HeaderTabs,
        AppHeader
    },
    data() {
        return {
            isLoading: false,
            trainingTypes: [],
            editDialogVisible: false,
            addDialogVisible: false,
            editFormData: {
                id: null,
                name: ''
            },
            newTrainingType: {
                name: ''
            },
            editRules: {
                name: [
                    { required: true, message: 'Name is required', trigger: 'blur' },
                    { min: 2, message: 'Name must be at least 2 characters long', trigger: 'blur' },
                    { max: 50, message: 'Name must be no more than 50 characters long', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.fetchTrainingTypes()
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        },
        async fetchTrainingTypes() {
            this.isLoading = true
            try {
                const data = await getTrainingTypeListAPI()
                this.trainingTypes = data
            } catch ({ response }) {
                if (response?.data?.details) {
                    const { details } = response.data
                    details.forEach((detail) => {
                        ElMessage.error(detail)
                    })
                } else {
                    ElMessage.error('An error occurred, please try again later')
                }
            } finally {
                this.isLoading = false
            }
        },
        openEditDialog(trainingType) {
            this.editFormData = { id: trainingType.id, name: trainingType.name }
            this.editDialogVisible = true
        },
        async saveTrainingType() {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        await updateTrainingTypeAPI(this.editFormData.id, { name: this.editFormData.name })
                        ElMessage.success('Training type updated successfully')
                        this.editDialogVisible = false
                        this.fetchTrainingTypes()
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
        async deleteTrainingType(trainingType) {
            this.$confirm('Are you sure you want to delete this training type?', 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(async () => {
                try {
                    await deleteTrainingTypeAPI(trainingType.id)
                    ElMessage.success('Training type deleted successfully')
                    this.fetchTrainingTypes()
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
            })
        },
        openAddDialog() {
            this.newTrainingType.name = ''
            this.addDialogVisible = true
        },
        async saveNewTrainingType() {
            this.$refs.addForm.validate(async (valid) => {
                if (valid) {
                    try {
                        await createTrainingTypeAPI({ name: this.newTrainingType.name })
                        ElMessage.success('Training type added successfully')
                        this.addDialogVisible = false
                        this.fetchTrainingTypes()
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

.centered-table {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    width: 100%;
    overflow-x: auto;
    table-layout: fixed;
}

.centered-table :deep(.el-table__body-wrapper),
.centered-table :deep(.el-table__header-wrapper) {
    width: 100% !important;
    overflow: hidden;
}

.centered-table :deep(.el-table__row) {
    display: table-row;
    width: 100%;
}

.centered-table :deep(.el-table__cell) {
    padding: 12px;
    text-align: center;
    vertical-align: middle;
    word-break: break-word;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    width: 100%;
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

.centered-select .el-select {
    width: 80%;
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

    .centered-table {
        font-size: 14px;
    }

    .el-button {
        padding: 6px 8px;
        font-size: 12px;
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

    .centered-select .el-select {
        width: 90%;
    }

    .dialog-footer {
        width: 90%;
    }
}
</style>