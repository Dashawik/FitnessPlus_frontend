import { makeApiRequest, API_URL } from './api'

export async function loginApi(email, password) {
    return makeApiRequest(`${API_URL}/user/login`, 'POST', {
        email,
        password,
    })
}

export async function registerApi(firstName, lastName, email, password) {
    return makeApiRequest(`${API_URL}/user/register`, 'POST', {
        firstName,
        lastName,
        email,
        password,
    })
}

export async function verificationRquestAPI(email) {
    return makeApiRequest(`${API_URL}/user/verification/request`, 'GET', null, { email })
}

export async function verificationConfirmAPI(token) {
    return makeApiRequest(`${API_URL}/user/verification/confirm`, 'GET', null, { token })
}

export async function resetRquestAPI(email) {
    return makeApiRequest(`${API_URL}/user/reset/request`, 'GET', null, { email })
}

export async function resetConfirmAPI(token, password) {
    return makeApiRequest(`${API_URL}/user/reset/confirm`, 'POST', { token, password })
}

export async function getUserListAPI() {
    return makeApiRequest(`${API_URL}/user`, 'GET')
}

export async function deleteUserAPI(userId) {
    return makeApiRequest(`${API_URL}/user/${userId}`, 'DELETE')
}

export async function updateUserAPI(userId, userData) {
    return makeApiRequest(`${API_URL}/user/${userId}`, 'PUT', userData)
}

export async function resetAuthAPI(userId) {
    return makeApiRequest(`${API_URL}/user/token/${userId}`, 'DELETE')
}