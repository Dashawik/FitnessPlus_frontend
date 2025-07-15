import { makeApiRequest, API_URL } from '../api'

export async function getTrainingListAPI(startTime, endTime) {
    return makeApiRequest(`${API_URL}/training`, 'GET', null, { startTime, endTime })
}

export async function createTrainingAPI(startTime, endTime, typeId, trainerId, availableSpots) {
    return makeApiRequest(`${API_URL}/training`, 'POST', {
        startTime,
        endTime,
        typeId,
        trainerId,
        availableSpots
    })
}

export async function updateTrainingAPI(trainingId, trainingData) {
    return makeApiRequest(`${API_URL}/training/${trainingId}`, 'PUT', trainingData)
}

export async function deleteTrainingAPI(trainingId) {
    return makeApiRequest(`${API_URL}/training/${trainingId}`, 'DELETE')
}

export async function getTrainingBookingsAPI(trainingId) {
    return makeApiRequest(`${API_URL}/training/booking/${trainingId}`, 'GET')
}