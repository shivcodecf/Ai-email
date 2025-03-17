import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log(" MongoDB Connected"))

.catch((error) => console.error("MongoDB Connection Error:", error));


const emailSchema = new mongoose.Schema({

    recipients: String,
    subject: String,
    keyPoints: String,
    generatedEmail: String,
    createdAt: { type: Date, default: Date.now },

}); 

const Email = mongoose.model("Email", emailSchema);


// drafts email and schema  


const DraftSchema = new mongoose.Schema({

    recipients: { type: String, required: true },

    subject: { type: String, required: true },

    message: { type: String, required: true },

    attachments: [
        {
            filename: String,
            content: Buffer, 
        }
    ],

    createdAt: { type: Date, default: Date.now },
});
 
const Draft = mongoose.model("Draft", DraftSchema); 



// Generate Email Route
app.post("/api/generate-email", async (req, res) => {

    try {
        const { recipients, subject, keyPoints } = req.body;

        if (!recipients || !subject || !keyPoints) {
            return res.status(400).json({ error: "Missing required fields" });
        }
         

        
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Generate a professional email with the subject: "${subject}" based on the key points: "${keyPoints}".`,
                            },
                        ],
                    },
                ],
            },
            { headers: { "Content-Type": "application/json" } }
        );

       
        const generatedEmail = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate email.";

       
        const newEmail = new Email({ recipients, subject, keyPoints, generatedEmail });

        await newEmail.save();

        res.status(200).json({ success: true, generatedEmail });

    } catch (error) {

        console.error(" Error generating email:", error.message);

        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/api/send-email", upload.array("attachments", 5), async (req, res) => {

    try {

        console.log("📩 Email API hit!"); 

        const { recipients, subject, message } = req.body;

        if (!recipients || !subject || !message) {

            return res.status(400).json({ error: "All fields are required!" });

        }

        let attachments = [];

        if (req.files && req.files.length > 0) {

            attachments = req.files.map((file) => ({
                filename: file.originalname,
                content: file.buffer,
            }));

        }

        let transporter = nodemailer.createTransport({

            service: "gmail",

            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },

        });

        let mailOptions = {

            from: process.env.EMAIL_USER,
            to: recipients,
            subject,
            text: message,
            attachments,

        };

        await transporter.sendMail(mailOptions);

        // Save email as draft automatically
        const newDraft = new Draft({ recipients, subject, message, attachments });

        await newDraft.save();

        res.status(200).json({ success: true, message: "Email sent & draft saved successfully!" });

    } catch (error) {
        console.error("Error sending email:", error.message);
        res.status(500).json({ error: "Failed to send email" });
    }
});






app.post("api/save-draft", upload.array("attachments", 5), async (req, res) => {

    try {

        const { recipients, subject, message } = req.body;

        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map((file) => ({
                filename: file.originalname,
                content: file.buffer,
            }));
        }

        const newDraft = new Draft({ recipients, subject, message, attachments });

        await newDraft.save();

        res.status(201).json({ success: true, message: "Draft saved successfully!" });

    } catch (error) {

        console.error("Error saving draft:", error.message);

        res.status(500).json({ error: "Failed to save draft" });
    }
});




app.get("/api/get-drafts", async (req, res) => {

    try {
        const drafts = await Draft.find(); 

        res.status(200).json({ drafts }); 

    } catch (error) {

        console.error("Error fetching drafts:", error.message);

        res.status(500).json({ error: "Failed to fetch drafts" });
    }

});




app.put("api/update-draft/:id", upload.array("attachments", 5), async (req, res) => {

    try {

        const { recipients, subject, message } = req.body;

        let attachments = [];

        if (req.files && req.files.length > 0) {


            attachments = req.files.map((file) => ({

                filename: file.originalname,

                content: file.buffer,
            }));
        }

        const updatedDraft = await Draft.findByIdAndUpdate(

            req.params.id,
            { recipients, subject, message, attachments },
            { new: true }

        );

        res.status(200).json({ success: true, message: "Draft updated successfully!", draft: updatedDraft });

    } catch (error) {

        console.error("Error updating draft:", error.message);

        res.status(500).json({ error: "Failed to update draft" });
    }
});


app.delete("api/delete-draft/:id", async (req, res) => {

    try {

        await Draft.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Draft deleted successfully!" });

    } catch (error) {
        
        res.status(500).json({ error: "Failed to delete draft" });
    }
});





app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});
