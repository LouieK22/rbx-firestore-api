local function isInteger(n)
  return n == math.floor(n)
end

local function isArray(value)
	local isArray = true

	if typeof(value) ~= "table" then
		return false
	end

	for i, _ in pairs(value) do
		if typeof(i) ~= "number" or i < 1 or not isInteger(i) then
			return false
		end
	end

	return true
end

return isArray
