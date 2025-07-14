import { makeApiRequest, API_URL } from '../api'

export async function getSubscriptionListAPI() {
    return makeApiRequest(`${API_URL}/subscription`, 'GET')
}
