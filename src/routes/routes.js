import express from "express";
import {
   getList,
   getChaptersImages,
   getCompleted,
   getGenres_types_sort,
   getInfo,
   getLatestUpdates,
   getMangaByQueryAndCategory,
   getMangaBySearch,
   getRecommended,
   getTrending,
   mostViewed,
   getCharactersList,
   getRecommendation,
} from "../provider/provider.js";

const router = express.Router();

router.get("/genres", getGenres_types_sort);

router.get("/trending", getTrending);
router.get("/", getTrending);

router.get("/completed", getCompleted);
router.get("/recommended", getRecommended);
router.get("/latest-updates", getLatestUpdates);
router.get("/most-viewed", mostViewed);
router.get("/all/:query/:category?", getMangaByQueryAndCategory);
router.get("/search", getMangaBySearch);
router.get("/info/:id", getInfo);
router.get("/list/:id", getList);
// /list/one-piece-3?type=chap&lang=en
router.get("/read/:id", getChaptersImages);
// /read/my-hero-academia-colored-edition-65103?type=vol&lang=en&dataNumber=2
router.get("/characters/:id", getCharactersList);
router.get("/recommendation/:id", getRecommendation);

export default router;
