import { makeApiRequest, API_URL } from '../api'

export async function getSubscriptionListAPI() {
    return makeApiRequest(`${API_URL}/subscription`, 'GET')
}

export async function updateSubscriptionAPI(subscriptionId, subscriptionData) {
    return makeApiRequest(
        `${API_URL}/subscription/${subscriptionId}`,
        'PUT',
        subscriptionData,
    )
}