import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages';

const keyMessageSchema = z.object({
	company: z.string().nullable().describe('从JD中提取的公司名称'),
	position: z.string().nullable().describe('从JD中提取的职位名称')
})


const ResumeSchema = z.object({
	basics: z.object({
		name: z.string(),
		label: z.string().nullable().describe('要应聘的职位的名称，如果能与以往职位结合，可以综合应聘职位和以往职位的名称'),
		birth: z.string().nullable().describe('出生年份，YYYY格式输出'),
		image: z.string().nullable().describe('头像URL'),
		email: z.string().nullable(),
		phone: z.string().nullable(),
		url: z.string().nullable().describe('个人主页'),
		summary: z.string().nullable().describe('个人简介，突出与职位相关的技能和经验,' +
			' 以个人履历为主，应聘JD为辅，不要无中生有，提到的内容必须在工作经历或项目中有体现,' +
			' 如果个人履历与JD差别较大，只总结个人履历即可'),
		location: z.object({
			city: z.string().nullable(),
			region: z.string().nullable()
		}),
		profiles: z.array(z.object({
			network: z.string(),
			username: z.string().nullable(),
			url: z.string().nullable()
		}))
	}),

	work: z.array(z.object({
		name: z.string().describe('公司名称, 中文输出时带上英文，英文输出时不需要带中文'),
		company: z.string().nullable().describe('公司名称，和name字段重复'),
		position: z.string(),
		startDate: z.string().nullable().describe('精确到月即可，输出使用YYYY-MM-DD'),
		endDate: z.string().nullable().describe('精确到月即可，输出使用YYYY-MM-DD,' +
			' 如果是"至今"，设置为空字符'),
		summary: z.string().nullable(),
		highlights: z.array(z.string()).nullable()
	})).describe('按照时间倒序排列，不要丢掉整段的工作经历'),

	education: z.array(z.object({
		institution: z.string(),
		area: z.string().nullable().describe('专业'),
		studyType: z.string().nullable().describe('学位'),
		startDate: z.string().nullable().describe('精确到年即可'),
		endDate: z.string().nullable().describe('精确到年即可'),
		courses: z.array(z.string()).nullable()
	})).describe('Education details, 按照时间正序排列，不要丢掉任何教育经历'),

	certificates: z.array(z.object({
		name: z.string().describe('认证名保持英文'),
		date: z.string().nullable().describe('精确到月即可, 输出使用YYYY-MM-DD'),
		issuer: z.string().nullable().describe('认证机构名称保持原语言')
	})),

	skills: z.array(z.object({
		name: z.string().describe('技能种类'),
		level: z.string().nullable().describe('可选值为 Master, Advanced, Intermediate, Beginner'),
		levelDisplay: z.string().nullable().describe('输出为英文时，设置为空字符，输出为中文时，对应Master:精通, Advanced: 熟练， Intermediate: 进阶， Beginner: 基础'),
		keywords: z.array(z.string()).nullable().describe('重点强调个人最擅长的技能和与JD相关的技能，列出不超过5个关键词，不要输出履历中完全没有提到或无法推断出的关键词')
	})).describe('以提供背景信息中的技能为主，不要超出提供技能的大类，以其他工作履历和项目中反映出的技能为辅，大类以3个为宜，子类关键词不超过5个'),

	languages: z.array(z.object({
		language: z.string(),
		fluency: z.string().nullable().describe('可选值为 Native Speaker, Fluent,' +
			' Intermediate, Beginner'),
		fluencyDisplay: z.string().nullable().describe('输出为英文时，设置为空字符，输出为中文时，对应 Native Speaker: 母语, Fluent:流利, Intermediate: 进阶， Beginner: 基础'),
	})),

	projects: z.array(z.object({
		name: z.string(),
		description: z.string().nullable(),
		highlights: z.array(z.string()).nullable(),
		keywords: z.array(z.string()).nullable(),
		startDate: z.string().nullable().describe('精确到月即可,输出使用YYYY-MM-DD'),
		endDate: z.string().nullable().describe('精确到月即可, 输出使用YYYY-MM-DD,' +
			' 如果是"至今"，设置为空字符'),
		roles: z.array(z.string()).nullable(),
		entity: z.string().nullable(),
		type: z.string().nullable()
	})).describe('Project details, 按照时间倒序排列，不要丢掉整段的项目经历'),

	// meta: z.record(z.any()).nullable()
});

export async function build(env, jd, backgound, language){

	const model = new ChatOpenAI({
		modelName: 'doubao-seed-1-6-250615',
		temperature: 0,
		streaming: false,
		apiKey: env.OPENAI_API_KEY,
		configuration: {
			baseURL: "https://ark.cn-beijing.volces.com/api/v3/",
		},
		modelKwargs: {
			thinking: {
				type: 'disabled'
			}
		}
	})

	const keyMessageResponse = await model.withStructuredOutput(keyMessageSchema).invoke([new HumanMessage(`请从以下职位描述中提取出公司名称和职位名称，输出为JSON格式：\n\n${jd}`)])

	console.log(keyMessageResponse)

	const baiduSearch = new ChatOpenAI({
		modelName: 'ernie-3.5-8k',
		streaming: false,
		apiKey: env.BAIDU_API_KEY,
		configuration: {
			baseURL: "https://qianfan.baidubce.com/v2/ai_search/",
		}
	})

	const baiduResponse = await baiduSearch.invoke([new HumanMessage(`${keyMessageResponse.company} 公司的背景、竞争形势及推测的潜在痛点`)])

	console.log(baiduResponse.content)

	const response = await model.withStructuredOutput(ResumeSchema)
		.invoke([new HumanMessage(`你好，请你扮演一位顶级的职业规划顾问和简历优化专家，你深度理解并擅长运用Keith M. Eades的《新解决方案销售（第2版）》理论来指导求职。

你的核心任务是：将我提供的个人履历，针对我给出的职位描述（JD）和公司背景，彻底改写为一份极具说服力的“解决方案式”简历。这份简历的每一句话都应该旨在向招聘方展示：我就是解决他们特定“痛点”的最佳人选。

**【重要约束】**：在整个过程中，你必须**严格基于我提供的【我的完整个人履历】中的信息**。**绝对不允许**虚构、夸大或创造任何我履历中不存在的工作经历、项目、技能或成就。你的任务是优化和重组，而不是编造。

**第一部分：核心信息输入**

**1. 职位描述 (JD):**
${jd}

**2. 我的完整个人履历 (原始版本):**
${backgound}

**3. 目标公司的背景、竞争形势及我推测的潜在痛点:**
${baiduResponse.content}
---

**第二部分：你的执行指令**

现在，请严格按照以下步骤，在你的“思考过程”中完成分析，并直接生成最终的简历成品：

**步骤1：诊断“痛点”**
首先，基于JD和公司背景信息，精准诊断出该公司在此职位上最想解决的2-3个核心业务“痛点”（例如：用户流失率高、市场份额被竞品挤压、新产品商业化路径不清晰等）。

**步骤2：映射“解决方案”**
然后，系统性地分析我的个人履历，将我的每一项关键技能、项目经验和可量化的成就，都视为一个“解决方案组件”。创建一个内在的逻辑映射，将我的“解决方案组件”与你诊断出的公司“痛点”进行强力关联。

**步骤3：撰写“解决方案式”简历**
最后，基于以上的“痛点-解决方案”映射，动笔撰写全新的简历。请遵循以下格式和措辞要求：

* **个人总结 (Summary):**
    * 以“价值主张”为核心，直接点明你能解决的关键问题。避免使用“经验丰富”等空洞词汇。
    * **结构**：一位专注于解决[公司核心痛点1]和[核心痛点2]的[你的职位]。通过[你的核心能力1]和[你的核心能力2]，驱动[关键业务成果]。过往项目中曾成功[列举一个与痛点最相关的、可量化的顶级成就]。
    * **【防伪指令】**：此部分提到的所有“核心能力”和“顶级成就”，**必须**能在我提供的原始履历中找到直接或间接的证据支持，**严禁杜撰**。

* **工作经历 (Work Experience):**
    * **彻底重写**每一条工作描述。将“负责...”的句式，改为“为解决[当时公司面临的问题]，主导/执行了[你的行动]，最终实现了[可量化的价值成果]”的句式。
    * **用词**：巧妙地融入JD中的关键词，但必须服务于“展示价值和解决问题”这一最终目的。

* **技能清单 (Skills):**
    * **重新排序**技能。将与JD要求最匹配、最能解决其痛点的技能置于最显眼的位置。
    * **【防伪指令】**：此清单中列出的**每一项技能**，都**必须**来源于我提供的原始履历。你可以对技能的名称进行微调（如同义词替换），以更贴合JD的用语，但**不可以添加任何履历中未提及的新技能**。

请现在开始执行任务，按照Schema的要求，输出简历，注意使用${language==='cn'? '中文' : '英文'}输出`)])

	console.log(JSON.stringify(response, null, 2))
	return response
}
