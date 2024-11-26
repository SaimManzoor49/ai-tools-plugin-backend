import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import OpenAI from "openai";


export const AiHumanizer = asyncHandler(async (req:Request, res:Response) => {
    const {text} = req.body
    if(text?.trim()?.length>8){
         res.status(400).json({ response: 'Input text is not correct or too short.' })
    }
    console.log(process.env.OPENAI_API_KEY)
    const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY});

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant specializing in rewriting text to make it sound more human and natural. When provided with robotic or AI-generated text, refine it to read as if written by a person, using a conversational tone and natural phrasing. Your response will only include the processed text, with no additional characters or explanations. if the given text(prompt) is not correct response with please provide correct text." },
            {
                role: "user",
                content: text,
            },
        ],
    });

    console.log(completion.choices[0].message);
    res.status(200).json({ response: completion.choices[0].message })
});
