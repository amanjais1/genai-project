const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "matchScore": <number 0-100>,
  "title": "<job title>",
  "technicalQuestions": [
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "skillGaps": [
    { "skill": "...", "severity": "low" | "medium" | "high" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "...", "tasks": ["...", "..."] }
  ]
}
Do not include any explanation, markdown, or text outside the JSON.`

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",   // ✅ valid model name
        contents: prompt,
        config: {
            responseMimeType: "application/json",  // this alone is enough
        },
    })

    const report = JSON.parse(response.text)
    return report
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
    })

    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a resume for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Respond ONLY with a valid JSON object with a single field:
{
  "html": "<full HTML string of the resume>"
}

Rules for the HTML resume:
- Tailored to the job description
- Professional, simple, ATS-friendly design
- 1-2 pages when printed to A4 PDF
- No AI-sounding language
- Well-structured with clear sections
- Do not include markdown or any text outside the JSON.`

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",   // ✅ valid model name
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    })

    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }