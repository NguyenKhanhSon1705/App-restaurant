import ENV from '@/../env.json'
const env = {
    API_URL: ENV.API_URL,
    SOCKET_URL: `${ENV.API_URL}/hub/ws-order-table-area`,
    LANGUAGE: ENV.LANGUAGE,
    SHOP_ID: ENV.SHOP_ID,
    ACCESS_TOKEN: ENV.ACCESS_TOKEN
}

export default env