export const jsonResponse = (data, status = 200) => {
	return new Response(JSON.stringify(data), {
		status: status,
		headers: { 'Content-Type': 'application/json;charset=UTF-8' },
	});
};

export const errorResponse = (message, status=500) => {
	return jsonResponse({ error: message, status: status }, status);
};
