import { api } from "./api";

export const getFavoriteLists = () => api.get("/favorites");
export const createFavoriteList = (list_name) => api.post("/favorites", { list_name });
export const addMovieToList = (listId, movie) =>
  api.post(`/favorites/${listId}/movies`, movie);
export const getListWithMovies = (listId) => api.get(`/favorites/${listId}`);

export const deleteFavoriteList = (listId) => api.delete(`/favorites/${listId}`);
export const removeMovieFromList = (listId, movieId) =>
  api.delete(`/favorites/${listId}/movies/${movieId}`);