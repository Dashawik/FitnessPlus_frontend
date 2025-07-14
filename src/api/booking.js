import { makeApiRequest, API_URL } from './api'

export async function getBookingListAPI() {
    return makeApiRequest(`${API_URL}/booking`, 'GET')
}

export async function cancelBookingAPI(bookingId) {
    return makeApiRequest(`${API_URL}/booking/cancel/${bookingId}`, 'PUT')
}


