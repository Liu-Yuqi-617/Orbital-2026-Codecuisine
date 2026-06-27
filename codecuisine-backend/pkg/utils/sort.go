package utils

import (
	"sort"
)

// Sorting for any type of slices
func SortBy[T any](slice []T, comparison_tool func(a, b T) bool) {
	sort.Slice(slice, func(i, j int) bool {
		return comparison_tool(slice[i], slice[j])
	})
}
