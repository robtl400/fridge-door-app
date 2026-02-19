from google import genai
from google.genai import types
from flask import current_app
import json

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = current_app.config.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not configured")
        _client = genai.Client(api_key=api_key)
    return _client


RECIPE_SCHEMA = {
    "type": "object",
    "properties": {
        "recipe_name": {
            "type": "string",
            "description": "The name of the recipe",
        },
        "description": {
            "type": "string",
            "description": "A brief 1-2 sentence description of the dish",
        },
        "source_attribution": {
            "type": "string",
            "description": "Recipe source, e.g. 'Inspired by NYT Cooking' or 'Classic French technique'",
        },
        "chef_attribution": {
            "type": "string",
            "description": "Chef or recipe developer name if applicable, otherwise empty string",
        },
        "source_url": {
            "type": "string",
            "description": "URL to original recipe if referencing a specific real recipe, otherwise empty string",
        },
        "ingredients": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "item": {"type": "string", "description": "Ingredient name"},
                    "amount": {
                        "type": "string",
                        "description": "Quantity with units, e.g. '2 cups' or '1 tablespoon'",
                    },
                    "in_stock": {
                        "type": "boolean",
                        "description": "true if this ingredient is in the user's inventory",
                    },
                },
                "required": ["item", "amount", "in_stock"],
            },
        },
        "instructions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Step-by-step cooking instructions",
        },
        "prep_time": {"type": "string", "description": "e.g. '15 minutes'"},
        "cook_time": {"type": "string", "description": "e.g. '30 minutes'"},
        "total_time": {"type": "string", "description": "e.g. '45 minutes'"},
        "servings": {"type": "integer", "description": "Number of servings"},
        "difficulty": {
            "type": "string",
            "description": "Easy, Medium, or Hard",
        },
        "tags": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Recipe tags like 'weeknight', 'comfort food', 'healthy'",
        },
    },
    "required": [
        "recipe_name",
        "description",
        "source_attribution",
        "ingredients",
        "instructions",
        "prep_time",
        "cook_time",
        "total_time",
        "servings",
        "difficulty",
    ],
}


def build_prompt(ingredients, dietary_restrictions=None, inventory_names=None):
    """Build the Gemini prompt for recipe generation."""
    ingredient_list = ", ".join(ingredients)
    inventory_str = ", ".join(inventory_names) if inventory_names else ingredient_list

    prompt = f"""You are a professional chef creating a recipe for a home cook.

INGREDIENTS THE USER WANTS TO USE: {ingredient_list}

THE USER'S FULL KITCHEN INVENTORY: {inventory_str}

REQUIREMENTS:
- Find ONE complete, delicious recipe that uses ALL or MOST of the requested ingredients
- Strongly prefer using ingredients already in the user's kitchen inventory
- Minimize ingredients not in their inventory — keep "need to buy" items to a bare minimum (ideally zero)
- For each ingredient in your recipe, set "in_stock" to true if it appears in the user's kitchen inventory list above, false if they would need to acquire it
- Provide COMPLETE, detailed instructions — do not abbreviate or skip steps
- Include exact measurements for all ingredients
- Draw inspiration from prestige recipe sources like NYT Cooking, Food52, Serious Eats, and Bon Appetit
- Set chef_attribution to a relevant chef name if the recipe style is inspired by a known chef, otherwise use an empty string
- Only set source_url if referencing a specific, real, publicly accessible recipe URL — otherwise use an empty string
- The recipe MUST be complete — include every step from prep to plating
- Provide realistic prep_time, cook_time, and total_time estimates"""

    if dietary_restrictions:
        restrictions_str = ", ".join(dietary_restrictions)
        prompt += f"""

DIETARY RESTRICTIONS (MUST BE STRICTLY FOLLOWED): {restrictions_str}
- The recipe MUST comply with ALL listed dietary restrictions
- If any requested ingredient violates a restriction, substitute it with a compliant alternative
- Do NOT include any ingredient that violates these restrictions"""

    return prompt


def generate_recipe(ingredients, dietary_restrictions=None, inventory_names=None):
    """Call Gemini API and return a parsed recipe dict."""
    client = _get_client()
    prompt = build_prompt(ingredients, dietary_restrictions, inventory_names)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RECIPE_SCHEMA,
            temperature=0.8,
        ),
    )

    recipe = json.loads(response.text)

    # Validate required fields
    required = ["recipe_name", "ingredients", "instructions"]
    if not all(key in recipe and recipe[key] for key in required):
        raise ValueError("Received incomplete recipe from AI")

    return recipe
