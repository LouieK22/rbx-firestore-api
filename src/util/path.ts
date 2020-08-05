export function cleanPath(path: string) {
	return path.gsub("^/*(.-)/*$", "%1")[0];
}

export function pathJoin(path1: string, path2: string) {
	const splitPath1 = cleanPath(path1).split("/");
	const splitPath2 = cleanPath(path2).split("/");

	const combined = [...splitPath1, ...splitPath2];

	return combined.join("/");
}
