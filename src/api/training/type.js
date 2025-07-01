import { makeApiRequest, API_URL } from '../api'

export async function getTrainingTypeListAPI() {
    return makeApiRequest(`${API_URL}/training/type`, 'GET')
}

export async function getTrainingTypeAPI(typeId) {
    return makeApiRequest(`${API_URL}/training/type/${typeId}`, 'GET')
}

export async function createTrainingTypeAPI(trainingTypeData) {
    return makeApiRequest(`${API_URL}/training/type`, 'POST', trainingTypeData)
}

export async function updateTrainingTypeAPI(typeId, trainingTypeData) {
    return makeApiRequest(`${API_URL}/training/type/${typeId}`, 'PUT', trainingTypeData)
}

export async function deleteTrainingTypeAPI(typeId) {
    return makeApiRequest(`${API_URL}/training/type/${typeId}`, 'DELETE')
}
