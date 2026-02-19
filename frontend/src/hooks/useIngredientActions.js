import { useCallback } from "react";
import { tossIngredient, deleteIngredient, updateIngredient } from "../services/ingredientApi";

export function useIngredientActions(kitchenKey, loadData, onDataChange, showToast) {
  const handleToss = useCallback(async (id, amount) => {
    try {
      await tossIngredient(kitchenKey, id, amount);
      showToast?.("Ingredient tracked and removed");
      loadData();
      onDataChange?.();
    } catch (err) {
      showToast?.("Something went wrong. Please try again.", "error");
      throw err;
    }
  }, [kitchenKey, loadData, onDataChange, showToast]);

  const handleEaten = useCallback(async (id) => {
    try {
      await deleteIngredient(kitchenKey, id);
      showToast?.("Ingredient removed!");
      loadData();
      onDataChange?.();
    } catch (err) {
      showToast?.("Something went wrong. Please try again.", "error");
      throw err;
    }
  }, [kitchenKey, loadData, onDataChange, showToast]);

  const handleQuantityChange = useCallback(async (id, newQuantity) => {
    try {
      await updateIngredient(kitchenKey, id, { quantity: newQuantity });
    } catch (err) {
      showToast?.("Failed to update quantity.", "error");
      throw err;
    }
  }, [kitchenKey, showToast]);

  const handleUpdate = useCallback(async (id, data) => {
    try {
      await updateIngredient(kitchenKey, id, data);
      loadData();
      onDataChange?.();
    } catch (err) {
      showToast?.("Failed to update. Please try again.", "error");
    }
  }, [kitchenKey, loadData, onDataChange, showToast]);

  return { handleToss, handleEaten, handleQuantityChange, handleUpdate };
}
