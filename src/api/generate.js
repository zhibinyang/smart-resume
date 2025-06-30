import {jsonResponse,errorResponse } from '../helper/response'

async function mockAnalyzeJD(jdText) {
	console.log("AI is analyzing JD text:", jdText.substring(0, 100) + "...");
	return Promise.resolve({
		position: 'Frontend Developer',
		company: "Awesome Tech Inc.",
		keywords: ["Vue 3", "Cloudflare Workers", "TypeScript", "Project Management"],
	});
}

async function mockGenerateResume(analysis){
	// ... (函数内容与之前版本相同)
	const fullProfile = { basics: { name: "张三", label: "全栈开发者 | 项目经理", email: "zhangsan@example.com", phone: "+86 188 8888 8888", url: "https://zhangsan.dev", summary: `一位经验丰富的全栈开发者...`, location: { city: "上海", countryCode: "CN" }, profiles: [{ network: "GitHub", username: "zhangsan-gh", url: "https://github.com/zhangsan-gh" }], }, work: [ { company: "前公司A", position: "高级软件工程师", startDate: "2020-01-01", summary: "..." }, { company: "前公司B", position: "项目经理", startDate: "2022-05-01", summary: "..." } ], skills: [ { name: "核心技术", keywords: ["JavaScript", "TypeScript", "Node.js", "Python"] }, { name: "前端", keywords: ["Vue 3", "React", "Vite", "Webpack", "TailwindCSS"] }, { name: "后端 & 云", keywords: ["Cloudflare Workers", "Serverless", "D1", "KV", "Docker"] } ], education: [{ institution: "某某大学", area: "计算机科学", studyType: "硕士", startDate: "2017-09-01", endDate: "2020-06-01" }], };
	const tailoredSummary = `针对 ${analysis.company} 的 ${analysis.keywords.join(', ')} 岗位...`;
	fullProfile.basics.summary = tailoredSummary;
	return Promise.resolve(fullProfile);
}

export async function generateResumeJSON(text, env) {
	const analysis = await mockAnalyzeJD(text)
	const resumeJson = await mockGenerateResume(analysis);

	const resumeId = crypto.randomUUID();
	const now = new Date().toISOString();

	const { success } = await env.DB.prepare(
		"INSERT INTO resumes (uuid, company, position," +
		" resume_json, created_at) VALUES (?, ?, ?, ?, ?)"
	).bind(resumeId, 'Awesome Inc.', 'Frontend Engineer', JSON.stringify(resumeJson), now).run();

	if(!success) {
		return errorResponse("Failed to save resume to database", 500);
	}
	return{
		uuid: resumeId,
		resume: resumeJson
	}
}
