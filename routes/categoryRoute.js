const router = require("express").Router();

const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require("../controllers/categoriesController");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifiyTokenAndAdmin } = require("../middlewares/verifiyToken");


// /api/categories
router.post("/", verifiyTokenAndAdmin, createCategoryCtrl);


// /api/categories
router.get("/", getAllCategoriesCtrl);

// /api/categories/:id
router.delete("/:id", validateObjectId, verifiyTokenAndAdmin, deleteCategoryCtrl);


module.exports = router;