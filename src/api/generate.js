import {jsonResponse,errorResponse } from '../helper/response'

import { build } from '../ai/build';

function toMarkdown(items) {
	return items.map(item => {
		return `### ${item.type}

#### Content
${item.content}

#### Date
${item.date}`;
	}).join("\n\n");
}

export async function generateResumeJSON(text, language, env) {

	const backgounds = await env.DB.prepare("SELECT * FROM contents").all();

	const backgroundString = toMarkdown(backgounds.results);

	const result = await build(env, text, backgroundString, language );

	const resumeId = crypto.randomUUID();
	const now = new Date().toISOString();

	// const { success } = await env.DB.prepare(
	// 	"INSERT INTO resumes (uuid, company, position," +
	// 	" resume_json, created_at) VALUES (?, ?, ?, ?, ?)"
	// ).bind(resumeId, 'Awesome Inc.', 'Frontend Engineer', JSON.stringify(resumeJson), now).run();

	// if(!success) {
	// 	return errorResponse("Failed to save resume to database", 500);
	// }
	return{
		uuid: resumeId,
		resume: result
	}
}
