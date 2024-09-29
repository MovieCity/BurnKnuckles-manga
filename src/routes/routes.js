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
} from "../provider/provider.js";

const router = express.Router();

router.get("/genres", getGenres_types_sort);

router.get("/trending", getTrending);
router.get("/completed", getCompleted);
router.get("/recommended", getRecommended);
router.get("/latest-updates", getLatestUpdates);
router.get("/most-viewed", mostViewed);
router.get("/all/:query/:category?", getMangaByQueryAndCategory);
router.get("/search", getMangaBySearch);
router.get("/info/:id", getInfo);
router.get("/list/:id", getList);
router.get("/read/:id/:readingId", getChaptersImages);

export default router;
