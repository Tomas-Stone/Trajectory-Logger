import axios from 'axios';

const HUGGING_FACE_API_URL = 'https://api.huggingface.co/models';

export const fetchHuggingFaceModels = async () => {
    try {
        const response = await axios.get(HUGGING_FACE_API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching Hugging Face models:', error);
        throw error;
    }
};

export const generateTaskFromDataset = async (modelId, inputData) => {
    try {
        const response = await axios.post(`${HUGGING_FACE_API_URL}/${modelId}/generate`, {
            inputs: inputData,
        });
        return response.data;
    } catch (error) {
        console.error('Error generating task from dataset:', error);
        throw error;
    }
};