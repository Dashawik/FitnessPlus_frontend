import { makeApiRequest, API_URL } from './api'

export async function getPopularTrainingTypes() {
    return makeApiRequest(`${API_URL}/report/getPopularTrainingTypes`, 'GET',
    )
}

export async function getBookingsPerTrainer() {
    return makeApiRequest(`${API_URL}/report/getBookingsPerTrainer`, 'GET',
    )
}

export async function getTrainingActivityByDay() {
    return makeApiRequest(`${API_URL}/report/getTrainingActivityByDay`, 'GET',
    )
}

