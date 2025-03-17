import { useState } from "react";
import axios from "axios";

const API_URL = "https://ai-email-8jgv.onrender.com/api/drafts";

export default function Mail() {
  const [recipients, setRecipients] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [subject, setSubject] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  const handleFileChange = (event) => {

    setFiles(Array.from(event.target.files));

  };

  const handleGenerateEmail = async () => {

    setLoading(true);

    try {

      const response = await fetch("https://ai-email-8jgv.onrender.com/api/generate-email", {

        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ recipients, subject, keyPoints }),

      });

      const data = await response.json();

      if (data.success) {
        setGeneratedEmail(data.generatedEmail);
      }

    } 
    catch (error) {
      console.error("Error generating email:", error);
    } finally {
      setLoading(false);
    }

  };

  const sendEmail = async () => {

    if (!recipients.trim() || !subject.trim() || !generatedEmail.trim()) {

        alert("Please enter all fields before sending.");
        return;

    }

    const formData = new FormData();

    formData.append("recipients", recipients);

    formData.append("subject", subject);

    formData.append("message", generatedEmail);

    
    if (files?.length) {

        files.forEach((file) => {
            formData.append("attachments", file); 
        });

    }

    try {

       setLoading1(true); 

        console.log("Sending formData:", formData); 

        const response = await axios.post("https://ai-email-8jgv.onrender.com/api/send-email", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        alert(response.data?.message || "Email sent successfully!");

    } catch (error) {

        console.error("Email sending failed", error.response?.data || error);
        alert(error.response?.data?.error || "Failed to send email.");

    } finally {

      setLoading1(false); 
  }
};



 



  return (

    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">

      <h2 className="text-2xl font-bold mb-4 text-left">AI Email Generator</h2>

     
      <label className="block font-medium mb-1 text-left">Recipients (comma-separated):</label>

      <input
        type="text"
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        className="w-full p-2 border rounded mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Enter email addresses"
      />

      
      <label className="block font-medium mb-1 text-left">Key Points:</label>

      <textarea
        value={keyPoints}
        onChange={(e) => setKeyPoints(e.target.value)}
        className="w-full p-2 border rounded mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Enter key points for the email"
      />

     
      <label className="block font-medium mb-1 text-left">Attach Files:</label>

      <div className="relative w-full">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-center cursor-pointer hover:bg-gray-300 transition duration-200 block"
        >
          📎 Choose Files
        </label>

        <p className="text-sm text-gray-500 mt-1">
          {files.length > 0 ? `${files.length} file(s) selected` : "No file chosen"}
        </p>

      </div>

      
      <label className="block font-medium mt-4 mb-1 text-left">Subject:</label>

      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 border rounded mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
      />

     
      <button
        onClick={handleGenerateEmail}
        className={`w-full p-2 rounded font-medium text-white cursor-pointer ${
          loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Email"}

      </button>

      
      <label className="block font-medium mt-4 mb-1 text-left">Generated Email (Editable):</label>

      <textarea
        value={generatedEmail}
        onChange={(e) => setGeneratedEmail(e.target.value)}
        className="w-full p-2 border rounded mb-3 h-60 resize-none bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
      />

      
      <button
    onClick={sendEmail}
    disabled={loading1}  
    className={`w-full py-2 rounded mt-4 transition duration-200 cursor-pointer ${
        loading1 ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
    }`}
>
    {loading1 ? "Sending..." : "Send Email"}
</button>

    </div>
  );
}
