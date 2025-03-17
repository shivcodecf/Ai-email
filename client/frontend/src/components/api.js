import axios from "axios";

const API_URL = "http://localhost:5000/api";


export const saveDraft = async (formData) => {

    return axios.post(`${API_URL}/save-draft`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

};


export const getDrafts = async () => {

    try {

        const response = await axios.get("http://localhost:5000/api/get-drafts");
        
        return response.data.drafts || []; 

    } catch (error) {
        console.error("Error fetching drafts:", error);
        return []; 
    }

};



export const updateDraft = async (id, formData) => {

    return axios.put(`${API_URL}/update-draft/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

};


export const deleteDraft = async (id) => {

    return axios.delete(`${API_URL}/delete-draft/${id}`);

};
