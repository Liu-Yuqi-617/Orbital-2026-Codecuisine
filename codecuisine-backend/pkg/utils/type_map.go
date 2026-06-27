package utils

// InferCuisineType maps Google Places types to standardized cuisine classifications
func InferCuisineType(placeTypes []string) string {
	// Google Places API cuisine type → internal standard classification mapping table
	cuisineMap := map[string]string{
		// Asian cuisines
		"chinese_restaurant":      "chinese",
		"japanese_restaurant":     "japanese",
		"korean_restaurant":       "korean",
		"thai_restaurant":         "thai",
		"vietnamese_restaurant":   "vietnamese",
		"indian_restaurant":       "indian",
		"malaysian_restaurant":    "malaysian",
		"indonesian_restaurant":   "indonesian",
		"filipino_restaurant":     "filipino",
		"singaporean_restaurant":  "singaporean",
		"burmese_restaurant":      "burmese",
		"cambodian_restaurant":    "cambodian",
		"laotian_restaurant":      "laotian",
		"mongolian_restaurant":    "mongolian",
		"nepalese_restaurant":     "nepalese",
		"pakistani_restaurant":    "pakistani",
		"sri_lankan_restaurant":   "sri_lankan",
		"bangladeshi_restaurant":  "bangladeshi",
		"taiwanese_restaurant":    "chinese",
		"hong_kong_restaurant":    "chinese",
		"sichuan_restaurant":      "chinese",
		"cantonese_restaurant":    "chinese",
		"shanghainese_restaurant": "chinese",
		"ramen_restaurant":        "japanese",
		"sushi_restaurant":        "japanese",
		"izakaya":                 "japanese",
		"tempura_restaurant":      "japanese",
		"teppanyaki_restaurant":   "japanese",
		"yakitori_restaurant":     "japanese",
		"korean_bbq_restaurant":   "korean",
		"hot_pot_restaurant":      "chinese",
		"dim_sum_restaurant":      "chinese",
		"noodle_restaurant":       "chinese",
		"pho_restaurant":          "vietnamese",
		"banh_mi_restaurant":      "vietnamese",
		"curry_restaurant":        "indian",
		"tandoor_restaurant":      "indian",
		"dosa_restaurant":         "indian",
		"bibimbap_restaurant":     "korean",

		// European cuisines
		"italian_restaurant":       "italian",
		"french_restaurant":        "french",
		"spanish_restaurant":       "spanish",
		"greek_restaurant":         "greek",
		"german_restaurant":        "german",
		"british_restaurant":       "british",
		"irish_restaurant":         "irish",
		"portuguese_restaurant":    "portuguese",
		"russian_restaurant":       "russian",
		"polish_restaurant":        "polish",
		"turkish_restaurant":       "turkish",
		"mediterranean_restaurant": "mediterranean",
		"pizza_restaurant":         "italian",
		"pasta_restaurant":         "italian",
		"steak_house":              "steakhouse",
		"seafood_restaurant":       "seafood",
		"tapas_restaurant":         "spanish",
		"fondue_restaurant":        "french",
		"schnitzel_restaurant":     "german",
		"belgian_restaurant":       "belgian",
		"austrian_restaurant":      "austrian",
		"swiss_restaurant":         "swiss",
		"dutch_restaurant":         "dutch",
		"scandinavian_restaurant":  "scandinavian",
		"hungarian_restaurant":     "hungarian",
		"czech_restaurant":         "czech",
		"ukrainian_restaurant":     "ukrainian",

		// American cuisines
		"american_restaurant":       "american",
		"mexican_restaurant":        "mexican",
		"brazilian_restaurant":      "brazilian",
		"peruvian_restaurant":       "peruvian",
		"argentinian_restaurant":    "argentinian",
		"colombian_restaurant":      "colombian",
		"venezuelan_restaurant":     "venezuelan",
		"chilean_restaurant":        "chilean",
		"cuban_restaurant":          "cuban",
		"jamaican_restaurant":       "jamaican",
		"haitian_restaurant":        "haitian",
		"caribbean_restaurant":      "caribbean",
		"latin_american_restaurant": "latin_american",
		"tex_mex_restaurant":        "tex_mex",
		"soul_food_restaurant":      "soul_food",
		"cajun_restaurant":          "cajun",
		"creole_restaurant":         "creole",
		"barbecue_restaurant":       "bbq",
		"burger_restaurant":         "american",
		"sandwich_restaurant":       "american",
		"diner":                     "american",
		"taco_restaurant":           "mexican",
		"burrito_restaurant":        "mexican",
		"nacho_restaurant":          "mexican",
		"ceviche_restaurant":        "peruvian",
		"churrasco_restaurant":      "brazilian",

		// Middle Eastern / African cuisines
		"middle_eastern_restaurant": "middle_eastern",
		"lebanese_restaurant":       "lebanese",
		"israeli_restaurant":        "israeli",
		"persian_restaurant":        "persian",
		"iranian_restaurant":        "persian",
		"moroccan_restaurant":       "moroccan",
		"egyptian_restaurant":       "egyptian",
		"ethiopian_restaurant":      "ethiopian",
		"african_restaurant":        "african",
		"syrian_restaurant":         "syrian",
		"jordanian_restaurant":      "jordanian",
		"iraqi_restaurant":          "iraqi",
		"afghan_restaurant":         "afghan",
		"armenian_restaurant":       "armenian",
		"georgian_restaurant":       "georgian",
		"kebab_restaurant":          "middle_eastern",
		"falafel_restaurant":        "middle_eastern",
		"shawarma_restaurant":       "middle_eastern",
		"hummus_restaurant":         "middle_eastern",

		// Other specialty cuisines
		"fusion_restaurant":        "fusion",
		"vegetarian_restaurant":    "vegetarian",
		"vegan_restaurant":         "vegan",
		"gluten_free_restaurant":   "gluten_free",
		"organic_restaurant":       "organic",
		"healthy_restaurant":       "healthy",
		"farm_to_table_restaurant": "farm_to_table",
		"fine_dining_restaurant":   "fine_dining",
		"buffet_restaurant":        "buffet",
		"breakfast_restaurant":     "breakfast",
		"brunch_restaurant":        "brunch",
		"bakery":                   "bakery",
		"dessert_restaurant":       "dessert",
		"ice_cream_shop":           "dessert",
		"juice_bar":                "healthy",
		"smoothie_bar":             "healthy",
		"salad_bar":                "healthy",
		"soup_restaurant":          "soup",
		"sandwich_shop":            "sandwich",
		"deli":                     "deli",
		"cafeteria":                "cafeteria",
		"food_court":               "food_court",
		"street_food_restaurant":   "street_food",
		"food_truck":               "street_food",
		"pub":                      "pub_food",
		"sports_bar":               "pub_food",
		"wine_bar":                 "wine_bar",
		"cocktail_bar":             "cocktail_bar",
		"seafood_market":           "seafood",
		"fish_and_chips_shop":      "british",
		"pie_shop":                 "bakery",
		"donut_shop":               "dessert",
		"bagel_shop":               "bakery",
		"creperie":                 "french",
		"waffle_restaurant":        "belgian",
		"pancake_house":            "breakfast",
		"omelette_restaurant":      "breakfast",
		"hot_dog_stand":            "fast_food",
		"fried_chicken_restaurant": "fast_food",
	}

	// First pass: directly match specific cuisine types
	for _, t := range placeTypes {
		if cuisine, ok := cuisineMap[t]; ok {
			return cuisine
		}
	}

	// Second pass: infer based on generic types (if no specific cuisine matched)
	for _, t := range placeTypes {
		switch t {
		case "restaurant":
			// Generic restaurant, unable to determine specific cuisine
			continue
		case "cafe":
			return "cafe"
		case "bakery":
			return "bakery"
		case "bar":
			return "bar"
		case "meal_delivery", "meal_takeaway":
			return "takeaway"
		case "night_club":
			return "nightlife"
		}
	}

	// Fallback: unknown
	return "unknown"
}
