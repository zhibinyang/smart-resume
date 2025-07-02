/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {jsonResponse,errorResponse } from './helper/response'
import {generateResumeJSON} from './api/generate';

export default {
	async fetch(request, env, ctx) {
		console.log(env)
		const url = new URL(request.url);
		const method = request.method;
		if(method === 'POST' && url.pathname === '/api/generate'){
			const body = await request.json();
			if(!body.text || typeof body.text !== 'string' || body.text.trim() === '') {
				return errorResponse("Request body must contain a non-empty" +
					" 'text' field.", 400);
			}
			return jsonResponse(await generateResumeJSON(body.text, body.language || 'en', env));
		} else if(method === 'GET' && url.pathname.startsWith('/api/resume/')){

		}
		return errorResponse('Not Found', 404);
	},
};
