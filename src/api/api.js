import axios from 'axios'
import Cookies from 'js-cookie'
import router from '../router'

export const API_URL = 'https://api-fitnessplus.sded.cc'

const getAccessToken = () => {
    return Cookies.get('accessToken')
}

export const refreshToken = async () => {
    try {
        const refreshToken = Cookies.get('refreshToken')
        const response = await axios.get(`${API_URL}/user/token/refresh`, {
            headers: {
                Authorization: refreshToken,
                'Content-Type': 'application/json',
            },
        })
        const { accessToken } = response.data

        Cookies.set('accessToken', accessToken, { expires: 5 / (24 * 60) })

        return accessToken
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const makeApiRequest = async (url, method, data = null, params = null) => {
    const accessToken = getAccessToken()

    try {
        const response = await axios({
            method,
            url: `${url}`,
            headers: {
                Authorization: `${accessToken}`,
                'Content-Type': 'application/json',
            },
            data,
            params
        })

        return response.data
    } catch (error) {
        console.log(error);

        if (error.response && (error.response.data.message == 'Unauthorized' || error.response.data.message == 'No token provided')) {
            try {
                await refreshToken()
                return makeApiRequest(url, method, data)
            } catch (error) {
                void error
                Cookies.remove('accessToken')
                Cookies.remove('refreshToken')
                Cookies.remove('user')

                router.push('/login')
            }
        }

        throw error
    }
}
