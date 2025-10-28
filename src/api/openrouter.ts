import axios from 'axios';

const OPENROUTER_API_URL = 'https://api.openrouter.com/deepseek/deepseek-r1-0528:free';

export const generateTask = async (inputData) => {
    try {
        const response = await axios.post(OPENROUTER_API_URL, {
            data: inputData
        });
        return response.data;
    } catch (error) {
        console.error('Error generating task:', error);
        throw error;
    }
};