import { useEffect, useState } from "react";
import { getDrafts, deleteDraft, updateDraft } from "./api";

const Drafts = () => {

    const [drafts, setDrafts] = useState([]);

    const [editingDraft, setEditingDraft] = useState(null);

    const [editedData, setEditedData] = useState({ recipients: "", subject: "", message: "" });

    useEffect(() => {

        const fetchDrafts = async () => {
            const data = await getDrafts();
            setDrafts(data);
        };

        fetchDrafts();

    }, []);

    return (

        <div>
            <h2>Saved Drafts</h2>
            {Array.isArray(drafts) && drafts.length > 0 ? (
    drafts.map((draft) => (
        <div key={draft._id}>
            <h3>{draft.subject}</h3>
            <p>{draft.message}</p>
        </div>
    ))
    
) : (
    <p>No drafts available</p>
)}

        </div>
    );
};

export default Drafts;
