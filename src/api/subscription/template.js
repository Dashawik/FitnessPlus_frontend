import { makeApiRequest, API_URL } from '../api'

export async function getSubscriptionListAPI() {
    return makeApiRequest(`${API_URL}/subscription/template`, 'GET')
}

export async function getSubscriptionAPI(subscriptionId) {
    return makeApiRequest(`${API_URL}/subscription/template/${subscriptionId}`, 'GET')
}

export async function createSubscriptionAPI(subscriptionData) {
    return makeApiRequest(`${API_URL}/subscription/template`, 'POST', subscriptionData)
}

export async function updateSubscriptionAPI(subscriptionId, subscriptionData) {
    return makeApiRequest(`${API_URL}/subscription/template/${subscriptionId}`, 'PUT', subscriptionData)
}

export async function deleteSubscriptionAPI(subscriptionId) {
    return makeApiRequest(`${API_URL}/subscription/template/${subscriptionId}`, 'DELETE')
}