import { makeApiRequest, API_URL } from './api'

export async function createPaymentAPI(templateId) {
    const startDate = new Date().toISOString()
    return makeApiRequest(`${API_URL}/fakePayment`, 'POST', {
        templateId, startDate
    }
    )
}

