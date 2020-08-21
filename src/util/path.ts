/**
 * Removes preceding and trailing forward slashes from a path
 * @param path Firestore path
 */
export function cleanPath(path: string) {
	return path.gsub("^/*(.-)/*$", "%1")[0];
}

/**
 * Safely combines two arbitrary paths
 * @param path1 Starting path
 * @param path2 Ending path
 */
export function pathJoin(path1: string, path2: string) {
	const splitPath1 = cleanPath(path1).split("/");
	const splitPath2 = cleanPath(path2).split("/");

	const combined = [...splitPath1, ...splitPath2];

	return combined.join("/");
}
