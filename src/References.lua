local references = setmetatable({}, {
	__index = function(self, index)
		self[index] = require(script.Parent:FindFirstChild(index))[index]
		return self[index]
	end
})

return references
